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

  return { ok: true, email };
}
