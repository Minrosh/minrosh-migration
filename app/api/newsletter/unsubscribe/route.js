import { unsubscribeNewsletterByToken } from "@/lib/newsletter";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getMaxNewsletterBodyBytes } from "@/lib/validation/newsletter-schema";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`newsletter-unsub:${ip}`, { windowMs: 15 * 60 * 1000, max: 30 })) {
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
  const token = String(body?.token || "").trim();
  if (!token) {
    return apiFail(
      { code: API_ERROR_CODES.VALIDATION_FAILED, message: "Missing unsubscribe token.", status: 400 },
      context
    );
  }
  const result = unsubscribeNewsletterByToken(token);
  if (!result.ok) {
    return apiFail(
      { code: API_ERROR_CODES.VALIDATION_FAILED, message: result.error || "Could not unsubscribe.", status: 400 },
      context
    );
  }
  return apiOk({
    already: Boolean(result.already),
    message: result.already ? "This address is already unsubscribed." : "You have been unsubscribed from marketing emails.",
  }, context);
}

export async function GET(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`newsletter-unsub-get:${ip}`, { windowMs: 15 * 60 * 1000, max: 40 })) {
    return Response.redirect(new URL("/newsletter/unsubscribe?error=1&reason=rate_limited", request.url), 302);
  }
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get("token") || "").trim();
  if (!token) {
    return Response.redirect(new URL("/newsletter/unsubscribe?error=1&reason=missing_token", request.url), 302);
  }
  const result = unsubscribeNewsletterByToken(token);
  if (!result.ok) {
    return Response.redirect(new URL("/newsletter/unsubscribe?error=1&reason=invalid_token", request.url), 302);
  }
  const successUrl = new URL("/newsletter/unsubscribe?ok=1", request.url);
  if (result.already) {
    successUrl.searchParams.set("already", "1");
  }
  return Response.redirect(successUrl, 302);
}
