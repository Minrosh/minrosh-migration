import { saveNewsletterEntry, sendNewsletterWelcomeEmail } from "../../../lib/newsletter";
import { parseNewsletterSubmission, getMaxNewsletterBodyBytes } from "../../../lib/validation/newsletter-schema";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`newsletter:${ip}`, { windowMs: 15 * 60 * 1000, max: 15 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests. Try again later.", status: 429 }, context);
  }

  const maxBytes = getMaxNewsletterBodyBytes();
  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid request.", status: 400 }, context);
  }
  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON body.", status: 400 }, context);
  }

  const parsed = parseNewsletterSubmission(body);
  if (!parsed.ok) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: parsed.error, status: 400 }, context);
  }

  const result = saveNewsletterEntry(parsed.email, { marketingConsent: parsed.marketingConsent });
  if (result.error) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: result.error, status: 400 }, context);
  }

  let emailSent = false;
  let emailReason = "";
  // Send a thank-you email only for new subscriptions or re-subscriptions.
  if (!result.exists || result.resubscribed) {
    try {
      const mail = await sendNewsletterWelcomeEmail(parsed.email);
      emailSent = Boolean(mail?.sent);
      emailReason = mail?.reason || "";
    } catch {
      emailSent = false;
      emailReason = "mail_send_failed";
    }
  }

  return apiOk({
    exists: result.exists || false,
    emailSent,
    emailReason,
    message: result.resubscribed
      ? "Your subscription is active again. You can unsubscribe from any marketing email."
      : result.exists
        ? "This email is already subscribed."
        : "Thanks for subscribing. You will receive migration and visa updates by email.",
  }, context);
}
