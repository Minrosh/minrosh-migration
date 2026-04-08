import nodemailer from "nodemailer";

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

export async function notifyAdminDraftReady({ headline, country, draftId }) {
  const transporter = getMailTransport();
  if (!transporter) return { sent: false, reason: "smtp_not_configured" };
  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const to = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER;
  if (!to) return { sent: false, reason: "no_admin_email" };
  const appBase = (process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const adminHref = appBase ? `${appBase}/admin/intelligence` : "/admin/intelligence";
  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: `[Intelligence] Pending draft ready (${country})`,
    text: [
      "A new intelligence draft is ready for moderation.",
      "",
      `Draft ID: ${draftId}`,
      `Country: ${country}`,
      `Headline: ${headline}`,
      `Review: ${adminHref}`,
    ].join("\n"),
  });
  return { sent: true };
}
