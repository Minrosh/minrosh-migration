import { NextResponse } from "next/server";
import { verifyAdminSessionCookie } from "./lib/admin/session-signed-cookie";
import { getAdminSessionValueFromRequestCookies } from "./lib/admin/session-cookie";
import { isLocalAdminDevBypassFromHost } from "./lib/admin/dev-bypass";
import { buildContentSecurityPolicy } from "./lib/csp/build-csp-header";
import { getOrCreateRequestId, REQUEST_ID_HEADER } from "./lib/observability/request-id";

const MAINTENANCE_VALUES = new Set(["1", "true", "on", "yes"]);

function maintenanceHtml() {
  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MinRosh Migration | Maintenance</title>
  </head>
  <body>
    <main>
      <h1>Upgrading for a better experience</h1>
      <p>MinRosh Migration is briefly undergoing maintenance. Please try again shortly.</p>
      <p>
        <a href="tel:+61478100542">Call 0478 100 542</a> |
        <a href="mailto:info@minroshmigration.com.au">Email info@minroshmigration.com.au</a>
      </p>
    </main>
  </body>
</html>`;
}

function newCspNonce() {
  const bytesToBase64 = (bytes) => {
    if (typeof btoa === "function") {
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    throw new Error("Web Crypto getRandomValues is required for CSP nonces");
  }
  return bytesToBase64(cryptoObj.getRandomValues(new Uint8Array(16)));
}

/**
 * Edge middleware: maintenance gate + admin session + CSP for HTML routes.
 * Public pages use hash-friendly CSP (`'self'` + `'unsafe-inline'`) so statically cached
 * HTML script tags keep working. Admin uses per-request nonce + `strict-dynamic`.
 */
export async function middleware(request) {
  const host = request.headers.get("host") || "";
  if (host === "www.minroshmigration.com.au") {
    const url = request.nextUrl.clone();
    url.hostname = "minroshmigration.com.au";
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = request.nextUrl;
  const nonce = newCspNonce();
  const requestId = getOrCreateRequestId(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-csp-nonce", nonce);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const production = process.env.NODE_ENV === "production";
  const isAdminApp =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  const csp = buildContentSecurityPolicy(nonce, {
    production,
    mode: isAdminApp ? "admin" : "public",
  });

  function withCsp(response) {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  function continueRequest({ htmlNoStore = false } = {}) {
    const response = withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
    if (htmlNoStore) {
      response.headers.set("Cache-Control", "private, no-cache, max-age=0, must-revalidate");
      response.headers.set("CDN-Cache-Control", "no-store");
    }
    if (isStagingSite(host) && !isAdminApp) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return response;
  }

  function isStagingSite(hostHeader) {
    const h = String(hostHeader || "").toLowerCase();
    if (h.includes("staging.minroshmigration.com.au")) return true;
    return String(process.env.STAGING_SITE || "").trim().toLowerCase() === "true";
  }

  const maintenanceMode = production
    ? MAINTENANCE_VALUES.has(String(process.env.MAINTENANCE_MODE || "").toLowerCase())
    : false;
  const bypassToken = String(process.env.MAINTENANCE_BYPASS_TOKEN || "").trim();
  const reqBypassToken =
    request.nextUrl.searchParams.get("maintenance_bypass") ||
    request.headers.get("x-maintenance-bypass") ||
    request.cookies.get("maintenance_bypass")?.value ||
    "";
  const hasBypass = Boolean(bypassToken) && reqBypassToken === bypassToken;
  const maintenancePublicBypass =
    pathname === "/maintenance" ||
    pathname === "/maintenance.html" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/admin/") ||
    pathname === "/admin";
  const maintenanceApiBypass =
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/inngest") ||
    pathname.startsWith("/api/webhooks/");

  if (maintenanceMode && !hasBypass && !maintenancePublicBypass && !maintenanceApiBypass) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { error: "Maintenance mode is active. Please try again shortly." },
        { status: 503 }
      );
      response.headers.set("Retry-After", "120");
      response.headers.set("Cache-Control", "no-store");
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return withCsp(response);
    }

    const response = new NextResponse(maintenanceHtml(), {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
    response.headers.set("Retry-After", "120");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return withCsp(response);
  }

  if (!isAdminApp) {
    return continueRequest({ htmlNoStore: true });
  }

  if (isLocalAdminDevBypassFromHost(host)) {
    return continueRequest();
  }

  if (pathname.startsWith("/admin/login")) return continueRequest();

  if (pathname === "/api/admin/login") return continueRequest();

  /** Setup probe — no secrets; used by login page and local diagnostics. */
  if (pathname === "/api/admin/health" && request.method === "GET") return continueRequest();

  /** Public link from verification email (no session yet). */
  if (pathname === "/api/admin/verify-admin-email") return continueRequest();

  const cookieVal = getAdminSessionValueFromRequestCookies(request.cookies);
  const secret = String(process.env.ADMIN_SESSION_SECRET || "").trim();
  const signed = cookieVal && secret ? await verifyAdminSessionCookie(cookieVal, secret) : { ok: false };
  const ok = signed.ok;
  if (!ok) {
    if (pathname.startsWith("/api/admin/")) {
      return withCsp(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return withCsp(NextResponse.redirect(login));
  }

  return continueRequest();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|txt|xml|webmanifest|pdf)$).*)",
  ],
};
