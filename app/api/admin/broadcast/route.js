import nodemailer from "nodemailer";
import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
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
  const denied = await requireAdminWrite(request);
  if (denied) return denied;

  const ip = getClientIp(request);
  if (!rateLimitAllow(`admin-broadcast:${ip}`, { windowMs: 60 * 60 * 1000, max: 8 })) {
    return Response.json({ error: "Too many broadcast requests. Try again later." }, { status: 429 });
  }
  if (!rateLimitAllow(`admin-broadcast-day:${ip}`, { windowMs: 24 * 60 * 60 * 1000, max: 15 })) {
    return Response.json({ error: "Daily broadcast limit reached. Try again tomorrow." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const SUBJECT_MAX = 200;
  const TEXT_MAX = 50_000;
  const LARGE_MIN = Math.max(1, Number(process.env.BROADCAST_LARGE_RECIPIENT_MIN || 20));

  const subject = String(body.subject || "").trim();
  const text = String(body.text || "").trim();
  if (!subject || !text) {
    return Response.json({ error: "subject and text required" }, { status: 400 });
  }
  if (/[\r\n]/.test(subject)) {
    return Response.json({ error: "Subject cannot contain line breaks." }, { status: 400 });
  }
  if (subject.length > SUBJECT_MAX) {
    return Response.json({ error: `Subject too long (max ${SUBJECT_MAX} characters).` }, { status: 400 });
  }
  if (text.length > TEXT_MAX) {
    return Response.json({ error: `Message too long (max ${TEXT_MAX} characters).` }, { status: 400 });
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
    return Response.json({ error: "No prospective customer emails", sent: 0 });
  }

  if (unique.length >= LARGE_MIN && body.broadcastConfirmed !== true) {
    return Response.json(
      {
        error: "Large send requires confirmation.",
        recipientCount: unique.length,
        needsBroadcastConfirmation: true,
        hint: "Resend the same JSON with broadcastConfirmed: true after reviewing recipients.",
      },
      { status: 409 }
    );
  }

  const transporter = getMailTransport();
  if (!transporter) {
    return Response.json({ error: "SMTP not configured" }, { status: 503 });
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

  appendAudit("broadcast_prospective", `${unique.length} recipients`, {
    ip,
    route: "POST /api/admin/broadcast",
  });
  logSecurityEvent("broadcast_sent", { recipientCount: unique.length, ip });
  return Response.json({ ok: true, sent: unique.length });
}
