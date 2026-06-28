/**
 * Send uptime-watch alert email via project SMTP settings.
 *
 * Usage:
 *   node --env-file=.env scripts/uptime-notify.mjs --subject "..." --body "..."
 *   echo "multi\nline" | node --env-file=.env scripts/uptime-notify.mjs --subject "..."
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return "";
  return process.argv[idx + 1];
}

const subject = argValue("--subject").trim();
let body = argValue("--body");

if (!body && argValue("--body-file")) {
  body = readFileSync(argValue("--body-file"), "utf8");
}

if (!body) {
  try {
    body = readFileSync(0, "utf8");
  } catch {
    body = "";
  }
}

if (!subject) {
  console.error("FAIL: --subject is required");
  process.exit(1);
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const user = process.env.SMTP_USER;
const pass = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");
const from = (process.env.SMTP_FROM || user || "").trim();
const to = String(
  process.env.UPTIME_WATCH_ALERT_EMAIL ||
    process.env.ADMIN_ALERT_EMAIL ||
    user ||
    "",
).trim();

if (!host || !user || !pass) {
  console.error("FAIL: SMTP_HOST, SMTP_USER, and SMTP_PASS must be set in .env");
  process.exit(1);
}

if (!to) {
  console.error("FAIL: set UPTIME_WATCH_ALERT_EMAIL or ADMIN_ALERT_EMAIL in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

try {
  await transporter.sendMail({
    from,
    to,
    subject,
    text: body.trim() || "(no details)",
  });
  console.log("PASS: alert sent to", to);
} catch (err) {
  console.error("FAIL:", err?.message || err);
  process.exit(1);
}
