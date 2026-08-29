/**
 * Public-facing outbound mail: prefer Gmail API (service account) over SMTP app password.
 */
import { getBrochureAttachments } from "./brochure-path";
import { sendGmailApiEmail } from "./gmail-api";
import { readGoogleServiceAccountCredentialsFromEnv } from "./google-service-account-private-key";
import { getMailTransport, contactInbox } from "./mail-transport";
import { sendSmtpMail, SmtpDailyCapError } from "./smtp-timeout";
import { checkSmtpDailySendCap, recordSmtpDailySend } from "./security/smtp-send-cap";
import { logSecurityEvent } from "./security/monitoring-log";

export function publicMailPrefersGmailApi() {
  return (
    String(process.env.PUBLIC_MAIL_USE_GMAIL_API ?? process.env.NURTURE_USE_GMAIL_API ?? "true").toLowerCase() !==
    "false"
  );
}

function gmailApiConfigured() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  const delegatedUser = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  return Boolean(clientEmail && privateKey && delegatedUser);
}

/** True when Gmail API or SMTP can send public mail. */
export function isPublicMailConfigured() {
  if (publicMailPrefersGmailApi() && gmailApiConfigured()) return true;
  return Boolean(getMailTransport());
}

/**
 * @param {{
 *   to: string,
 *   subject: string,
 *   text?: string,
 *   html?: string,
 *   includeBrochure?: boolean,
 *   replyTo?: string,
 *   enforceDailyCap?: boolean,
 * }} opts
 * @returns {Promise<{ sent: true, channel: "gmail_api" | "smtp" } | { sent: false, reason: string }>}
 */
export async function deliverPublicEmail(opts) {
  const {
    to,
    subject,
    text,
    html,
    includeBrochure = false,
    replyTo,
    enforceDailyCap = true,
  } = opts;

  if (enforceDailyCap) {
    const cap = checkSmtpDailySendCap(1);
    if (!cap.allowed) {
      logSecurityEvent("smtp_daily_cap_blocked", { count: cap.count, max: cap.max, date: cap.date });
      return { sent: false, reason: "smtp_daily_cap" };
    }
  }

  if (publicMailPrefersGmailApi() && gmailApiConfigured()) {
    try {
      const result = await sendGmailApiEmail({
        to,
        subject,
        text,
        html,
        includeBrochure,
        replyTo,
      });
      if (result.sent) {
        if (enforceDailyCap) recordSmtpDailySend(1);
        return { sent: true, channel: "gmail_api" };
      }
    } catch (err) {
      console.error("deliverPublicEmail gmail_api:", err);
    }
  }

  const transporter = getMailTransport();
  if (!transporter) {
    return { sent: false, reason: "mail_not_configured" };
  }

  const smtpFrom = process.env.SMTP_FROM || contactInbox;
  /** @type {import("nodemailer/lib/mailer").Options} */
  const mailOptions = {
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  };
  if (replyTo) mailOptions.replyTo = replyTo;
  if (includeBrochure) {
    mailOptions.attachments = getBrochureAttachments();
  }

  try {
    await sendSmtpMail(transporter, mailOptions, { enforceDailyCap });
    return { sent: true, channel: "smtp" };
  } catch (err) {
    if (err instanceof SmtpDailyCapError) {
      return { sent: false, reason: "smtp_daily_cap" };
    }
    throw err;
  }
}
