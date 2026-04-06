import { saveNewsletterEntry } from "../../../lib/newsletter";
import { parseNewsletterSubmission, getMaxNewsletterBodyBytes } from "../../../lib/validation/newsletter-schema";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`newsletter:${ip}`, { windowMs: 15 * 60 * 1000, max: 15 })) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const maxBytes = getMaxNewsletterBodyBytes();
  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseNewsletterSubmission(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const result = saveNewsletterEntry(parsed.email, { marketingConsent: parsed.marketingConsent });
  if (result.error) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({
    ok: true,
    exists: result.exists || false,
    message: result.resubscribed
      ? "Your subscription is active again. You can unsubscribe from any marketing email."
      : result.exists
        ? "This email is already subscribed."
        : "Thanks for subscribing. You will receive migration and visa updates by email.",
  });
}
