const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";

function isEnabled() {
  return String(process.env.REQUIRE_HCAPTCHA_ON_CONTACT || "").toLowerCase() === "true";
}

function secret() {
  return String(process.env.HCAPTCHA_SECRET || "").trim();
}

export function hCaptchaEnabledOnServer() {
  return isEnabled();
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
