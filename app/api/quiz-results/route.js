import crypto from "node:crypto";
import { contactInbox, getMailTransport } from "@/lib/contact";
import { withSmtpDeadline } from "@/lib/smtp-timeout";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { isValidEmailLinear } from "@/lib/validation/contact-schema";
import { dualWriteQuizLeadToSupabase } from "@/lib/supabase/enquiries-dual-write";
import { obsLogger } from "@/lib/observability/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

function safeField(value) {
  const text = String(value ?? "").trim();
  return text || "Not Provided";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Normalizes details to a clean Q&A list for email rendering.
 * Accepts arrays of `{question, answer}` or generic objects.
 * @param {unknown} details
 * @returns {Array<{ question: string, answer: string }>}
 */
function normalizeQuizDetails(details) {
  if (!details) return [];
  if (Array.isArray(details)) {
    return details
      .map((row, index) => {
        if (!row || typeof row !== "object") {
          return {
            question: `Question ${index + 1}`,
            answer: safeField(row),
          };
        }
        const typedRow = /** @type {Record<string, unknown>} */ (row);
        return {
          question: safeField(
            typedRow.question ??
              typedRow.label ??
              typedRow.key ??
              `Question ${index + 1}`
          ),
          answer: safeField(
            typedRow.answer ??
              typedRow.value ??
              typedRow.selection ??
              typedRow.response
          ),
        };
      })
      .filter((row) => row.question || row.answer);
  }
  if (typeof details === "object") {
    return Object.entries(/** @type {Record<string, unknown>} */ (details)).map(([key, value]) => ({
      question: safeField(key),
      answer: safeField(value),
    }));
  }
  return [{ question: "Details", answer: safeField(details) }];
}

/**
 * @param {{
 *   id: string,
 *   submittedAt: string,
 *   name: string,
 *   email: string,
 *   score: number | null,
 *   details: unknown,
 *   detailsText: string,
 *   clientIp: string
 * }} payload
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function saveQuizSubmissionToSupabase(payload) {
  const client = createSupabaseAdminClient();
  if (!client) {
    return { ok: false, error: "supabase_not_configured" };
  }
  const { error } = await client.from("quiz_submissions").insert({
    id: payload.id,
    submitted_at: payload.submittedAt,
    name: payload.name || null,
    email: payload.email || null,
    score: payload.score,
    details: payload.details ?? null,
    details_text: payload.detailsText || null,
    client_ip: payload.clientIp || null,
  });
  if (error) {
    return { ok: false, error: error.message || "quiz_submissions_insert_failed" };
  }
  return { ok: true };
}

function safeSubjectFragment(name, score) {
  const raw = `${name}`.replace(/[\r\n\u0000]/g, " ").trim().slice(0, MAX_NAME_LEN);
  const s = Number.isFinite(score) ? Math.round(score) : "Not Provided";
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

  const nameRaw = String(body?.name ?? "").trim();
  const emailRaw = String(body?.email ?? "").trim();
  const scoreRaw = parseScore(body?.score);
  const score = Number.isFinite(scoreRaw) && scoreRaw >= 0 && scoreRaw <= 500 ? scoreRaw : null;

  const name = !nameRaw || nameRaw.length > MAX_NAME_LEN || hasCrLf(nameRaw) ? "" : nameRaw;
  const email = !emailRaw || hasCrLf(emailRaw) || !isValidEmailLinear(emailRaw) ? "" : emailRaw;

  let detailsText = "";
  if (body?.details !== undefined && body?.details !== null) {
    try {
      const raw = JSON.stringify(body.details);
      detailsText = raw.length > MAX_DETAILS_JSON_CHARS ? `${raw.slice(0, MAX_DETAILS_JSON_CHARS)}…` : raw;
    } catch {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Details must be JSON-serializable.", status: 400 }, context);
    }
  }

  /** enquiries_mirror.id must use QUIZ- prefix for quiz-result leads (see dualWriteQuizLeadToSupabase). */
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

  const quizSubmissionResult = await saveQuizSubmissionToSupabase({
    id: quizLeadId,
    submittedAt,
    name,
    email,
    score,
    details: body?.details ?? null,
    detailsText,
    clientIp: ip,
  });
  if (!quizSubmissionResult.ok) {
    obsLogger.error("quiz_submissions_insert_failed_pre_email", {
      quizLeadId,
      reason: String(quizSubmissionResult.error || "unknown"),
    });
    return apiFail(
      {
        code: API_ERROR_CODES.UPSTREAM_ERROR,
        message:
          "Your quiz submission could not be saved to our secure records right now, so email was not sent. Please retry in a few minutes.",
        status: 503,
        details: {
          reason: quizSubmissionResult.error || "quiz_submissions_insert_failed",
          quizLeadId,
        },
      },
      context
    );
  }

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
  const { displayName, scoreLabel } = safeSubjectFragment(name, score ?? NaN);
  const quizDetailsRows = normalizeQuizDetails(body?.details);
  const detailsRowsHtml = quizDetailsRows.length
    ? quizDetailsRows
        .map(
          (row) =>
            `<tr><td style="padding:8px;border:1px solid #e5d8dc;vertical-align:top;">${escapeHtml(row.question)}</td><td style="padding:8px;border:1px solid #e5d8dc;vertical-align:top;">${escapeHtml(row.answer)}</td></tr>`
        )
        .join("")
    : `<tr><td style="padding:8px;border:1px solid #e5d8dc;vertical-align:top;">Not Provided</td><td style="padding:8px;border:1px solid #e5d8dc;vertical-align:top;">Not Provided</td></tr>`;
  const detailsRowsText = quizDetailsRows.length
    ? quizDetailsRows.map((row, idx) => `${idx + 1}. ${row.question}: ${row.answer}`).join("\n")
    : "Not Provided";

  const normalizedName = safeField(name);
  const normalizedEmail = safeField(email);
  const normalizedScore = safeField(score);
  const mailOptions = {
    from: smtpFrom,
    to: contactInbox,
    ...(email ? { replyTo: email } : {}),
    subject: `Visa quiz: ${displayName} — ${scoreLabel} pts`,
    text: [
      "New visa / points quiz submission (website)",
      "",
      `Mirror ID: ${quizLeadId}`,
      `Name: ${normalizedName}`,
      `Email: ${normalizedEmail}`,
      `Score: ${normalizedScore}`,
      "",
      "Questions and Answers:",
      detailsRowsText,
    ].join("\n"),
    html: `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color:#1f1020;">
    <h2 style="margin:0 0 12px;">New Visa Quiz Submission</h2>
    <table style="border-collapse:collapse;width:100%;max-width:760px;margin-bottom:16px;">
      <tr>
        <th style="text-align:left;padding:8px;border:1px solid #e5d8dc;background:#fbf6f4;">Field</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5d8dc;background:#fbf6f4;">Value</th>
      </tr>
      <tr><td style="padding:8px;border:1px solid #e5d8dc;">Mirror ID</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtml(quizLeadId)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5d8dc;">Name</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtml(normalizedName)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5d8dc;">Email</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtml(normalizedEmail)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5d8dc;">Total Score</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtml(String(normalizedScore))}</td></tr>
    </table>
    <h3 style="margin:0 0 8px;">Questions and Answers</h3>
    <table style="border-collapse:collapse;width:100%;max-width:760px;">
      <tr>
        <th style="text-align:left;padding:8px;border:1px solid #e5d8dc;background:#fbf6f4;">Question</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5d8dc;background:#fbf6f4;">Answer</th>
      </tr>
      ${detailsRowsHtml}
    </table>
  </body>
</html>`,
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
