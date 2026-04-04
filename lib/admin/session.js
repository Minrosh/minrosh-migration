import { createAdminSession, validateAdminSessionToken } from "./session-store";
import {
  signAdminSessionCookie,
  verifyAdminSessionCookie,
} from "./session-signed-cookie";

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

/** Returns signed cookie value (not raw token). */
export async function createSessionToken() {
  const secret = getSessionSecret();
  if (!secret) return null;
  const { token, expiresAt } = createAdminSession();
  return signAdminSessionCookie(token, expiresAt, secret);
}

/** Full check: signed cookie + session store (Node / Route Handlers only). */
export async function isValidSessionToken(cookieValue) {
  const secret = getSessionSecret();
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
