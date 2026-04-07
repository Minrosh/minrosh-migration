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
  console.error(`FAIL: Missing SMTP_HOST, SMTP_USER, or SMTP_PASS.

Why this happens:
  • "npm run test:smtp" only reads the project .env file (via Node --env-file).
    Typing SMTP_PASS=... at the shell does NOT write .env — edit the file:

      cd ~/minrosh-migration
      nano .env

    Add one line per variable. If the app password has spaces, use quotes in .env:
      SMTP_PASS='ilfv xbnk fqlk prwe'
    (Google app passwords are 16 letters — no underscores; do not replace spaces with _.)

  • Or export in the shell and use the script that inherits your session:
      export SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_SECURE=false
      export SMTP_USER=info@minroshmigration.com.au
      export SMTP_PASS='ilfv xbnk fqlk prwe'
      export SMTP_FROM=info@minroshmigration.com.au
      npm run test:smtp:shell

PM2 / production mail uses .env next to ecosystem.config.js — put SMTP_* there too.`);
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
