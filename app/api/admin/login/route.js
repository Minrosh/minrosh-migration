import { cookies } from "next/headers";
import {
  hasAdminPasswordConfigured,
  hasAdminSessionSigningSecret,
  hintWhenSuperPasswordLoginUsesFileOnly,
  verifyAdminPassword,
} from "@/lib/admin/admin-auth";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { createSessionToken } from "@/lib/admin/session";
import { checkAdminUserLogin } from "@/lib/admin/admin-users-service";
import { adminSessionCookieName, clearAdminSessionCookies } from "@/lib/admin/session-cookie";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { requireAdminLoginOrigin } from "@/lib/admin/auth-route";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { logSecurityEvent } from "@/lib/security/monitoring-log";
import { verifySync } from "otplib";
import { obsLogger } from "@/lib/observability/logger";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const originDenied = requireAdminLoginOrigin(request);
  if (originDenied) return originDenied;

  const ip = getClientIp(request);
  if (!rateLimitAllow(`admin-login:${ip}`, { windowMs: 15 * 60 * 1000, max: 25 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many login attempts. Try again later.", status: 429 }, context);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  const password = String(body?.password || "");
  const email = String(body?.email || "").trim().toLowerCase();

  let sessionMeta = { email: null, role: "super", userId: null };

  if (email) {
    const auth = checkAdminUserLogin(email, password);
    if (!auth.ok) {
      appendAudit(AUDIT_ACTIONS.ADMIN_LOGIN_FAILED, auth.reason === "unverified" ? "email not verified" : "invalid email or password", {
        ip,
        route: "POST /api/admin/login",
        requestId: context.requestId,
      });
      logSecurityEvent("admin_login_failed", { ip });
      if (auth.reason === "unverified") {
        return apiFail(
          {
            code: API_ERROR_CODES.FORBIDDEN,
            message:
              "This email is not verified yet. Open the link we sent you, or ask a super admin to resend the verification email from Admin -> Users.",
            status: 403,
            details: { reason: "EMAIL_NOT_VERIFIED" },
          },
          context
        );
      }
      return apiFail({ code: API_ERROR_CODES.UNAUTHORIZED, message: "Invalid email or password", status: 401 }, context);
    }
    sessionMeta = { email: auth.user.email, role: auth.user.role, userId: auth.user.id };
  } else {
    if (!hasAdminPasswordConfigured()) {
      return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Admin password not configured", status: 503 }, context);
    }
    if (!verifyAdminPassword(password)) {
      appendAudit(AUDIT_ACTIONS.ADMIN_LOGIN_FAILED, "invalid password", {
        ip,
        route: "POST /api/admin/login",
        requestId: context.requestId,
      });
      logSecurityEvent("admin_login_failed", { ip });
      const hint = hintWhenSuperPasswordLoginUsesFileOnly();
      return apiFail(
        {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Invalid password",
          status: 401,
          ...(hint ? { details: { hint } } : {}),
        },
        context
      );
    }
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
      appendAudit(AUDIT_ACTIONS.ADMIN_LOGIN_FAILED, "invalid totp", {
        ip,
        route: "POST /api/admin/login",
        requestId: context.requestId,
      });
      return apiFail({ code: API_ERROR_CODES.UNAUTHORIZED, message: "Invalid authenticator code", status: 401 }, context);
    }
  }

  if (!hasAdminSessionSigningSecret()) {
    return apiFail(
      {
        code: API_ERROR_CODES.UPSTREAM_ERROR,
        message:
          "Admin session signing is not configured. Set ADMIN_SESSION_SECRET in .env (dedicated random secret for cookie HMAC). Edge middleware cannot use data/admin-auth.json or your login password for signing.",
        status: 503,
      },
      context
    );
  }

  let token;
  try {
    token = await createSessionToken(sessionMeta);
  } catch (err) {
    const msg = String(/** @type {{ message?: string }} */ (err)?.message || err || "unknown");
    obsLogger.error("admin_login_session_create_failed", {
      route: "POST /api/admin/login",
      requestId: context.requestId,
      error: msg.slice(0, 500),
    });
    return apiFail(
      {
        code: API_ERROR_CODES.UPSTREAM_ERROR,
        message:
          "Could not create an admin session on disk. Ensure the Node process can write data/admin-sessions.json (under PM2 cwd .next/standalone see ecosystem.config.js).",
        status: 503,
        details: { reason: "SESSION_STORAGE_FAILED" },
      },
      context
    );
  }

  if (!token) {
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: "Could not create session", status: 500 }, context);
  }

  try {
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
  } catch (err) {
    const msg = String(/** @type {{ message?: string }} */ (err)?.message || err || "unknown");
    obsLogger.error("admin_login_cookie_set_failed", {
      route: "POST /api/admin/login",
      requestId: context.requestId,
      error: msg.slice(0, 500),
    });
    return apiFail(
      {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Login succeeded but the session cookie could not be set. Check ADMIN_COOKIE_SECURE matches your site protocol.",
        status: 500,
        details: { reason: "COOKIE_SET_FAILED" },
      },
      context
    );
  }

  return apiOk({ authenticated: true }, context);
}
