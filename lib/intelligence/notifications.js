import nodemailer from "nodemailer";

/** Default digest mail for daily intelligence scan (override with INTELLIGENCE_DIGEST_EMAIL / ADMIN_ALERT_EMAIL). */
const DEFAULT_INTELLIGENCE_DIGEST_TO = "admin@minroshmigration.com.au";
const DEFAULT_INTELLIGENCE_DIGEST_FROM = "info@minroshmigration.com.au";

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

/**
 * After a scheduled cron scan: one email asking staff to verify Intelligence drafts / queue.
 * @param {{ result: object, startedAt: string, finishedAt: string }} opts
 */
export async function sendIntelligenceScanDigestEmail({ result, startedAt, finishedAt }) {
  const transporter = getMailTransport();
  if (!transporter) return { sent: false, reason: "smtp_not_configured" };
  const smtpFrom = (process.env.SMTP_FROM || DEFAULT_INTELLIGENCE_DIGEST_FROM).trim();
  const to = String(
    process.env.INTELLIGENCE_DIGEST_EMAIL || process.env.ADMIN_ALERT_EMAIL || DEFAULT_INTELLIGENCE_DIGEST_TO,
  ).trim();
  if (!to) return { sent: false, reason: "no_recipient" };

  const appBase = (process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const adminHref = appBase ? `${appBase}/admin/intelligence` : "https://minroshmigration.com.au/admin/intelligence";

  const scanned = Number(result?.scanned ?? 0);
  const changed = Number(result?.changed ?? 0);
  const lines = [
    "The daily intelligence scan has finished.",
    "",
    `Started: ${startedAt}`,
    `Finished: ${finishedAt}`,
    `Sources scanned: ${scanned}`,
    `Sources with detected changes (new drafts may exist): ${changed}`,
    "",
    "Please sign in to Admin → Intelligence, review any pending drafts for factual accuracy, then approve or reject before publishing.",
    "",
    `Open: ${adminHref}`,
    "",
    "This message was sent by the automated intelligence cron job.",
  ];

  const results = Array.isArray(result?.results) ? result.results : [];
  if (results.length > 0) {
    lines.push("", "Per source:");
    for (const r of results) {
      const bits = [r.sourceId, r.ok === false ? `error:${r.reason}` : r.changed ? "CHANGED" : "unchanged"].filter(
        Boolean,
      );
      lines.push(`- ${bits.join(" · ")}`);
    }
  }

  const subject = `[MinRosh] Intelligence scan complete — please verify (${changed} change${changed === 1 ? "" : "s"})`;
  const text = lines.join("\n");
  const safeHref = encodeURI(adminHref);
  const html = `<p>The daily <strong>intelligence scan</strong> has finished.</p>
<ul>
<li>Started: ${escapeHtml(startedAt)}</li>
<li>Finished: ${escapeHtml(finishedAt)}</li>
<li>Sources scanned: ${scanned}</li>
<li>Sources with changes: <strong>${changed}</strong></li>
</ul>
<p>Please review pending drafts in <a href="${safeHref}">Admin → Intelligence</a> before publishing.</p>`;

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch {
    return { sent: false, reason: "send_failed" };
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

