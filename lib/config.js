/**
 * Centralized reads for public build-time / runtime env flags (NEXT_PUBLIC_*).
 * Server-only secrets (SMTP, HCAPTCHA_SECRET, etc.) stay in their respective route libs.
 */

/** @returns {string} */
export function getHcaptchaSiteKeyPublic() {
  return typeof process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === "string"
    ? process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY.trim()
    : "";
}

/** True only when captcha is explicitly enabled and a site key is present (safe for client bundles). */
export function isHcaptchaPublicEnabled() {
  const enabled = String(process.env.NEXT_PUBLIC_ENABLE_HCAPTCHA || "").toLowerCase() === "true";
  return enabled && Boolean(getHcaptchaSiteKeyPublic());
}

let hcaptchaMisconfigWarned = false;

/**
 * Warn once when captcha is flagged on without a site key (avoids silent “enabled” UI drift).
 * Safe to call from server components or instrumentation.
 */
export function warnHcaptchaEnvIfMisconfigured() {
  if (hcaptchaMisconfigWarned) return;
  const enabled = String(process.env.NEXT_PUBLIC_ENABLE_HCAPTCHA || "").toLowerCase() === "true";
  const key = getHcaptchaSiteKeyPublic();
  if (!enabled || key) return;
  hcaptchaMisconfigWarned = true;
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[config] NEXT_PUBLIC_ENABLE_HCAPTCHA is true but NEXT_PUBLIC_HCAPTCHA_SITE_KEY is empty; captcha stays disabled.",
    );
  }
}
