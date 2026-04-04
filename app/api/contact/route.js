import { saveEnquiry, sendContactEmails } from "../../../lib/contact";
import { parseContactSubmission, getMaxContactBodyBytes } from "../../../lib/validation/contact-schema";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`contact:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const maxBytes = getMaxContactBodyBytes();
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
  if (rawText.length > maxBytes) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = parseContactSubmission(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  saveEnquiry(validated.value);

  try {
    const mailResult = await sendContactEmails(validated.value);
    return Response.json({
      ok: true,
      id: validated.value.id,
      internalSent: mailResult.internalSent,
      thankYouSent: mailResult.thankYouSent,
      brochureAttached: mailResult.brochureAttached || false,
      warning:
        mailResult.reason === "smtp_not_configured"
          ? "Enquiry saved, but SMTP is not configured yet."
          : undefined,
    });
  } catch {
    return Response.json({
      ok: true,
      id: validated.value.id,
      internalSent: false,
      thankYouSent: false,
      warning: "Enquiry saved, but email delivery could not be completed. We will still review your message.",
    });
  }
}
