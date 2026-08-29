const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";

function isEnabled() {
  const publicForms = String(process.env.REQUIRE_HCAPTCHA_ON_PUBLIC_FORMS || "").toLowerCase() === "true";
  const contactOnly = String(process.env.REQUIRE_HCAPTCHA_ON_CONTACT || "").toLowerCase() === "true";
  return publicForms || contactOnly;
}

function secret() {
  return String(process.env.HCAPTCHA_SECRET || "").trim();
}

export function hCaptchaEnabledOnServer() {
  return isEnabled();
}

/**
 * When captcha is required for public email-triggering forms, verify token on POST body.
 * @param {unknown} body
 * @param {string} remoteIp
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export async function verifyPublicFormHCaptcha(body, remoteIp = "") {
  if (!hCaptchaEnabledOnServer()) {
    return { ok: true };
  }
  const captchaToken = String(/** @type {{ hCaptchaToken?: string }} */ (body)?.hCaptchaToken || "").trim();
  if (!captchaToken) {
    return { ok: false, message: "Please complete captcha verification before submitting." };
  }
  const verification = await verifyHCaptchaToken({ token: captchaToken, remoteIp });
  if (!verification.ok) {
    return { ok: false, message: "Captcha verification failed. Please retry." };
  }
  return { ok: true };
}

export async function verifyHCaptchaToken({ token, remoteIp = "" }) {
  const captchaToken = String(token || "").trim();
  if (!captchaToken) {
    return { ok: false, reason: "missing_token" };
  }
  const hSecret = secret();
  if (!hSecret) {
    return { ok: false, reason: "missing_secret" };
  }

  const body = new URLSearchParams();
  body.set("secret", hSecret);
  body.set("response", captchaToken);
  if (remoteIp) body.set("remoteip", String(remoteIp));

  try {
    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
    const data = await response.json();
    return {
      ok: Boolean(data?.success),
      reason: Array.isArray(data?.["error-codes"]) ? data["error-codes"].join(",") : "",
    };
  } catch {
    return { ok: false, reason: "verification_unavailable" };
  }
}
