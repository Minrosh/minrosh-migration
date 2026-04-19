import { NextResponse } from "next/server";
import { verifyAdminSessionCookie } from "./lib/admin/session-signed-cookie";
import { getAdminSessionValueFromRequestCookies } from "./lib/admin/session-cookie";
import { buildContentSecurityPolicy } from "./lib/csp/build-csp-header";
import { getOrCreateRequestId, REQUEST_ID_HEADER } from "./lib/observability/request-id";

function newCspNonce() {
  try {
    return Buffer.from(globalThis.crypto.randomUUID()).toString("base64");
  } catch {
    return Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  }
}

/**
 * Edge middleware: admin session + CSP nonce for HTML routes.
 * Nonce is forwarded on the request (`x-csp-nonce`) so `app/layout.js` can pass it to `<Script nonce>`.
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
  const csp = buildContentSecurityPolicy(nonce, { production });

  function withCsp(response) {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  function continueRequest() {
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  const isAdminApp =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  if (!isAdminApp) {
    return continueRequest();
  }

  if (pathname.startsWith("/admin/login")) return continueRequest();

  if (pathname === "/api/admin/login") return continueRequest();

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
