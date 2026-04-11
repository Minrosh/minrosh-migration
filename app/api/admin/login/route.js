import { cookies } from "next/headers";
import {
  hasAdminPasswordConfigured,
  hasAdminSessionSigningSecret,
  verifyAdminPassword,
} from "@/lib/admin/admin-auth";
import { appendAudit } from "@/lib/admin/audit";
import { createSessionToken } from "@/lib/admin/session";
import { adminSessionCookieName, clearAdminSessionCookies } from "@/lib/admin/session-cookie";
import { requireAdminLoginOrigin } from "@/lib/admin/auth-route";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { logSecurityEvent } from "@/lib/security/monitoring-log";
import { verifySync } from "otplib";

export async function POST(request) {
  const originDenied = requireAdminLoginOrigin(request);
  if (originDenied) return originDenied;

  const ip = getClientIp(request);
  if (!rateLimitAllow(`admin-login:${ip}`, { windowMs: 15 * 60 * 1000, max: 25 })) {
    return Response.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = String(body?.password || "");
  if (!hasAdminPasswordConfigured()) {
    return Response.json({ error: "Admin password not configured" }, { status: 503 });
  }
  if (!verifyAdminPassword(password)) {
    appendAudit("admin_login_failed", "invalid password", {
      ip,
      route: "POST /api/admin/login",
    });
    logSecurityEvent("admin_login_failed", { ip });
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const totpSecret = String(process.env.ADMIN_TOTP_SECRET || "").trim();
  if (totpSecret) {
    const totp = String(body?.totp || body?.totpCode || "")
      .replace(/\s/g, "")
      .trim();
    let totpOk = false;
    try {
      totpOk = Boolean(totp && verifySync({ token: totp, secret: totpSecret }));
    } catch {
      totpOk = false;
    }
    if (!totpOk) {
      appendAudit("admin_login_failed", "invalid totp", {
        ip,
        route: "POST /api/admin/login",
      });
      return Response.json({ error: "Invalid authenticator code" }, { status: 401 });
    }
  }

  if (!hasAdminSessionSigningSecret()) {
    return Response.json(
      {
        error:
          "Admin session signing is not configured. Set ADMIN_SESSION_SECRET or a non-placeholder ADMIN_PASSWORD in .env. Edge middleware cannot use data/admin-auth.json for cookies.",
      },
      { status: 503 },
    );
  }

  const token = await createSessionToken();
  if (!token) {
    return Response.json({ error: "Could not create session" }, { status: 500 });
  }

  const jar = await cookies();
  const secure =
    process.env.ADMIN_COOKIE_SECURE === "true" ||
    (process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_SECURE !== "false");

  clearAdminSessionCookies(jar);
  const cookieName = adminSessionCookieName(secure);
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
