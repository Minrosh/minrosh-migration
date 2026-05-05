import crypto from "node:crypto";
import { contactInbox, getMailTransport } from "@/lib/contact";
import { withSmtpDeadline } from "@/lib/smtp-timeout";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { isValidEmailLinear } from "@/lib/validation/contact-schema";
import { dualWriteQuizLeadToSupabase } from "@/lib/supabase/enquiries-dual-write";
import { obsLogger } from "@/lib/observability/logger";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_NAME_LEN = 120;
const MAX_DETAILS_JSON_CHARS = 48_000;

function hasCrLf(s) {
  return /[\r\n]/.test(s);
}

function parseScore(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function safeSubjectFragment(name, score) {
  const raw = `${name}`.replace(/[\r\n\u0000]/g, " ").trim().slice(0, MAX_NAME_LEN);
  const s = Number.isFinite(score) ? Math.round(score) : "?";
  return { displayName: raw || "Visitor", scoreLabel: s };
}

/**
 * POST JSON: { name, email, score, details? }
 * Sends an internal notification to the site inbox using configured SMTP (see lib/contact.js).
 */
export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`quiz-results:${ip}`, { windowMs: 15 * 60 * 1000, max: 12 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests. Try again later.", status: 429 }, context);
  }

  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid request.", status: 400 }, context);
  }
  if (Buffer.byteLength(rawText, "utf8") > MAX_BODY_BYTES) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON body.", status: 400 }, context);
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const score = parseScore(body?.score);

  if (!name || name.length > MAX_NAME_LEN || hasCrLf(name)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Please provide a valid name.", status: 400 }, context);
  }
  if (!email || !isValidEmailLinear(email) || hasCrLf(email)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Please provide a valid email address.", status: 400 }, context);
  }
  if (!Number.isFinite(score) || score < 0 || score > 500) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Please provide a valid score.", status: 400 }, context);
  }

  let detailsText = "";
  if (body?.details !== undefined && body?.details !== null) {
    try {
      const raw = JSON.stringify(body.details);
      detailsText = raw.length > MAX_DETAILS_JSON_CHARS ? `${raw.slice(0, MAX_DETAILS_JSON_CHARS)}…` : raw;
    } catch {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Details must be JSON-serializable.", status: 400 }, context);
    }
  }

  const quizLeadId = `QUIZ-${crypto.randomUUID()}`;
  const submittedAt = new Date().toISOString();
  const mirrorPayload = {
    source: "quiz_results_api",
    id: quizLeadId,
    submittedAt,
    name,
    email,
    score,
    detailsText,
    clientIp: ip,
  };
  const supabaseResult = await dualWriteQuizLeadToSupabase(quizLeadId, mirrorPayload);
  const supabasePersisted = Boolean(supabaseResult.ok && !supabaseResult.skipped);

  const transporter = getMailTransport();
  if (!transporter) {
    if (supabasePersisted) {
      obsLogger.warn("quiz_results_smtp_missing_after_supabase", { quizLeadId });
      return apiOk(
        {
          success: true,
          warning:
            "Your quiz summary was stored securely; email delivery is offline on this server. Our team can still follow up from the backup record.",
        },
        context
      );
    }
    return apiFail(
      {
        code: API_ERROR_CODES.UPSTREAM_ERROR,
        message: "Email delivery is not configured on this server.",
        status: 503,
      },
      context
    );
  }

  const smtpFrom = process.env.SMTP_FROM || contactInbox;
  const { displayName, scoreLabel } = safeSubjectFragment(name, score);
  const mailOptions = {
    from: smtpFrom,
    to: contactInbox,
    replyTo: email,
    subject: `Visa quiz: ${displayName} — ${scoreLabel} pts`,
    text: [
      "New visa / points quiz submission (website)",
      "",
      `Mirror ID: ${quizLeadId}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Score: ${score}`,
      "",
      "Details:",
      detailsText || "(none)",
    ].join("\n"),
  };

  try {
    await withSmtpDeadline(transporter.sendMail(mailOptions));
  } catch (err) {
    console.error("quiz-results sendMail:", err);
    if (supabasePersisted) {
      obsLogger.warn("quiz_results_mail_failed_after_supabase", {
        quizLeadId,
        error: String(/** @type {{ message?: string }} */ (err)?.message || err),
      });
      return apiOk(
        {
          success: true,
          warning:
            "Your quiz summary was stored securely; our inbox email is temporarily unavailable. We will still retrieve your submission from our backup.",
        },
        context
      );
    }
    return apiFail(
      {
        code: API_ERROR_CODES.MAIL_DELIVERY_FAILED,
        message:
          "We could not deliver your quiz results by email right now. Please try again in a few minutes or contact us directly.",
        status: 503,
      },
      context
    );
  }

  return apiOk({ success: true }, context);
}
