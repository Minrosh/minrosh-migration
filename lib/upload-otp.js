import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getUploadSessionSecret } from "./upload-magic-link";

const OTP_TTL_MS = 15 * 60 * 1000;

export function generateSixDigitCode() {
  return String(randomInt(100000, 1000000));
}

export function hashUploadOtp(token, code) {
  const secret = getUploadSessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(`otp:${token}:${code}`).digest("hex");
}

export function verifyUploadOtpHash(token, code, storedHash) {
  if (!storedHash || !code) return false;
  const h = hashUploadOtp(token, code);
  if (h.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

export function computeOtpExpiresIso() {
  return new Date(Date.now() + OTP_TTL_MS).toISOString();
}

export function isOtpExpired(iso) {
  if (!iso) return true;
  return Date.now() > new Date(iso).getTime();
}

/** Signed cookie value proving OTP completed for this token. */
export function signUploadSessionToken(token) {
  const secret = getUploadSessionSecret();
  if (!secret || !token) return "";
  return createHmac("sha256", secret).update(`sess:${token}`).digest("base64url");
}

export function verifyUploadSessionSignature(token, cookieValue) {
  if (!token || !cookieValue) return false;
  const expected = signUploadSessionToken(token);
  if (!expected || expected.length !== cookieValue.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(cookieValue));
  } catch {
    return false;
  }
}
