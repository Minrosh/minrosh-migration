import { isValidEmailLinear } from "./contact-schema";

const MAX_BODY = 8 * 1024;

export function getMaxNewsletterBodyBytes() {
  return MAX_BODY;
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, email: string } | { ok: false, error: string }}
 */
export function parseNewsletterSubmission(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
  }

  const hp = body.company ?? body.website ?? body.url;
  if (hp !== undefined && hp !== null && String(hp).trim() !== "") {
    return { ok: false, error: "Invalid request." };
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required." };
  }
  if (!isValidEmailLinear(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const marketingConsent = body.marketingConsent === true || body.marketingConsent === "true";
  if (!marketingConsent) {
    return {
      ok: false,
      error: "Please confirm you agree to receive marketing emails (you can unsubscribe anytime).",
    };
  }

  return { ok: true, email, marketingConsent: true };
}
