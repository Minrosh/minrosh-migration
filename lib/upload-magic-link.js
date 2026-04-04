/** 72-hour client upload link validity (security posture). */
export const MAGIC_LINK_TTL_MS = 72 * 60 * 60 * 1000;

export function computeMagicLinkExpiryIso() {
  return new Date(Date.now() + MAGIC_LINK_TTL_MS).toISOString();
}

/**
 * @param {{ magicLinkExpiresAt?: string } | null | undefined} customer
 * @returns {boolean} true if link must be treated as expired
 */
export function isMagicLinkExpired(customer) {
  if (!customer?.magicLinkExpiresAt) return false;
  const t = new Date(customer.magicLinkExpiresAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() > t;
}

export function uploadSmsVerificationEnabled() {
  return String(process.env.UPLOAD_LINK_SMS_VERIFICATION || "").toLowerCase() === "true";
}

export function getUploadSessionSecret() {
  return (
    process.env.UPLOAD_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}
