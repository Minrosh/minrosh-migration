import {
  createAdminSession,
  getAdminSessionMetaFromRawToken,
  validateAdminSessionToken,
} from "./session-store";
import {
  signAdminSessionCookie,
  verifyAdminSessionCookie,
} from "./session-signed-cookie";

/**
 * HMAC signing material for admin session cookies (Edge + Node).
 * Use a dedicated high-entropy secret — never derive this from the login password.
 */
export function getAdminSessionSigningSecret() {
  return String(process.env.ADMIN_SESSION_SECRET || "").trim();
}

/** @deprecated Use getAdminSessionSigningSecret — password is not used for cookie HMAC. */
export function getSessionSecret() {
  return getAdminSessionSigningSecret();
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

/** Returns signed cookie value (not raw token). */
export async function createSessionToken(meta) {
  const secret = getAdminSessionSigningSecret();
  if (!secret) return null;
  const { token, expiresAt } = createAdminSession(meta || {});
  return signAdminSessionCookie(token, expiresAt, secret);
}

/** Cookie value → session actor (legacy password login maps to super). */
export async function getSessionMetaFromSignedCookieValue(cookieValue) {
  const secret = getAdminSessionSigningSecret();
  if (!cookieValue || !secret) return null;
  const signed = await verifyAdminSessionCookie(cookieValue, secret);
  if (!signed.ok) return null;
  if (!validateAdminSessionToken(signed.token)) return null;
  return getAdminSessionMetaFromRawToken(signed.token);
}

/** Full check: signed cookie + session store (Node / Route Handlers only). */
export async function isValidSessionToken(cookieValue) {
  const secret = getAdminSessionSigningSecret();
  if (!cookieValue || !secret) return false;

  const signed = await verifyAdminSessionCookie(cookieValue, secret);
  if (signed.ok) {
    return validateAdminSessionToken(signed.token);
  }

  if (/^[a-f0-9]{64}$/i.test(cookieValue)) {
    return validateAdminSessionToken(cookieValue);
  }

  return false;
}
