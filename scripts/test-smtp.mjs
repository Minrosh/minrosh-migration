/**
 * Verify SMTP credentials (Google Workspace / Gmail App Password, etc.).
 * Run from project root with env loaded, e.g.:
 *   node --env-file=.env scripts/test-smtp.mjs
 * Requires Node 20+ for --env-file, or export vars manually first.
 */
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const user = process.env.SMTP_USER;
const pass = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");

if (!host || !user || !pass) {
  console.error(
    "FAIL: Set SMTP_HOST, SMTP_USER, and SMTP_PASS (and usually SMTP_PORT / SMTP_SECURE). App passwords may include spaces — they are stripped automatically."
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log("PASS: SMTP connection verified for", host, "port", port, "secure=", secure);
} catch (e) {
  console.error("FAIL:", e?.message || e);
  process.exit(1);
}
