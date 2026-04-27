import nodemailer from "nodemailer";
import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { readCustomers } from "@/lib/admin/json-store";
import { isMarketingSuppressedEmail } from "@/lib/newsletter";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { logSecurityEvent } from "@/lib/security/monitoring-log";

function getMailTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;

  const ip = getClientIp(request);
  if (!rateLimitAllow(`admin-broadcast:${ip}`, { windowMs: 60 * 60 * 1000, max: 8 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many broadcast requests. Try again later.", status: 429 }, context);
  }
  if (!rateLimitAllow(`admin-broadcast-day:${ip}`, { windowMs: 24 * 60 * 60 * 1000, max: 15 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Daily broadcast limit reached. Try again tomorrow.", status: 429 }, context);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  const SUBJECT_MAX = 200;
  const TEXT_MAX = 50_000;
  const LARGE_MIN = Math.max(1, Number(process.env.BROADCAST_LARGE_RECIPIENT_MIN || 20));

  const subject = String(body.subject || "").trim();
  const text = String(body.text || "").trim();
  if (!subject || !text) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "subject and text required", status: 400 }, context);
  }
  if (/[\r\n]/.test(subject)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Subject cannot contain line breaks.", status: 400 }, context);
  }
  if (subject.length > SUBJECT_MAX) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: `Subject too long (max ${SUBJECT_MAX} characters).`, status: 400 }, context);
  }
  if (text.length > TEXT_MAX) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: `Message too long (max ${TEXT_MAX} characters).`, status: 400 }, context);
  }

  const { customers } = readCustomers();
  const emails = (customers || [])
    .filter(
      (c) =>
        c.status === "prospective" &&
        c.email &&
        c.marketingConsent !== false
    )
    .map((c) => c.email.trim().toLowerCase())
    .filter(Boolean)
    .filter((e) => !isMarketingSuppressedEmail(e));

  const unique = [...new Set(emails)];
  if (!unique.length) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "No prospective customer emails", status: 404 }, context);
  }

  if (unique.length >= LARGE_MIN && body.broadcastConfirmed !== true) {
    return apiFail(
      {
        code: API_ERROR_CODES.CONFLICT,
        message: "Large send requires confirmation.",
        status: 409,
        details: {
          recipientCount: unique.length,
          needsBroadcastConfirmation: true,
          hint: "Resend the same JSON with broadcastConfirmed: true after reviewing recipients.",
        },
      },
      context
    );
  }

  const transporter = getMailTransport();
  if (!transporter) {
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "SMTP not configured", status: 503 }, context);
  }

  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const bcc = unique.join(", ");
  const siteBase = (process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const complianceFooter = siteBase
    ? `\n\n---\nMinRosh Migration — prospective client update. Newsletter preferences: ${siteBase}/newsletter/unsubscribe`
    : "\n\n---\nMinRosh Migration — prospective client update. Reply to this email if you no longer wish to receive similar messages.";
  const textWithFooter = `${text}${complianceFooter}`;

  await transporter.sendMail({
    from: smtpFrom,
    to: smtpFrom,
    bcc,
    subject,
    text: textWithFooter,
    headers: process.env.SMTP_LIST_UNSUBSCRIBE
      ? { "List-Unsubscribe": `<${process.env.SMTP_LIST_UNSUBSCRIBE}>` }
      : undefined,
  });

  appendAudit(AUDIT_ACTIONS.BROADCAST_PROSPECTIVE, `${unique.length} recipients`, {
    ip,
    route: "POST /api/admin/broadcast",
    requestId: context.requestId,
  });
  logSecurityEvent("broadcast_sent", { recipientCount: unique.length, ip });
  return apiOk({ sent: unique.length }, context);
}
