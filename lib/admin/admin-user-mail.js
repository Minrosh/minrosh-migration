import { contactInbox, getMailTransport } from "../contact";
import { withSmtpDeadline } from "../smtp-timeout";

function escapeAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * @param {{ to: string, verifyUrl: string }} opts
 * @returns {Promise<{ ok: true } | { ok: false, reason: string }>}
 */
export async function sendAdminEmailVerification({ to, verifyUrl }) {
  const transporter = getMailTransport();
  if (!transporter) {
    return { ok: false, reason: "smtp_not_configured" };
  }
  const smtpFrom = process.env.SMTP_FROM || contactInbox;
  const safeUrl = escapeAttr(verifyUrl);
  const subject = "Verify your MinRosh admin account";
  const text = [
    "You were invited as an admin on MinRosh Migration.",
    "",
    "Open this link to verify your email (required before you can sign in):",
    verifyUrl,
    "",
    "The link expires in 48 hours. If you did not expect this message, you can ignore it.",
  ].join("\n");
  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,Segoe UI,sans-serif;line-height:1.5;color:#222;">
<p>You were invited as an admin on MinRosh Migration.</p>
<p><a href="${safeUrl}">Verify your email</a> to activate your account.</p>
<p style="font-size:0.9em;color:#555;">This link expires in 48 hours.</p>
</body></html>`;
  try {
    await withSmtpDeadline(
      transporter.sendMail({
        from: smtpFrom,
        to: String(to || "").trim(),
        subject,
        text,
        html,
      })
    );
    return { ok: true };
  } catch (error) {
    const message = String(error?.message || "send_failed").slice(0, 160);
    return { ok: false, reason: `send_failed:${message}` };
  }
}
