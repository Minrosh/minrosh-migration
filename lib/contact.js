/**
 * Enquiries and shared JSON helpers. For production scale, plan to move enquiries and related
 * records to a database for concurrency, backups, and audit trails.
 */
import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { withMutationLock } from "./json-mutation-lock";
import { isValidEmailLinear, parseContactSubmission } from "./validation/contact-schema";

const enquiriesLegacy = path.join(process.cwd(), "data-enquiries.json");
const enquiriesPreferred = path.join(process.cwd(), "data", "enquiries.json");
const enquiriesFile = process.env.ENQUIRIES_FILE || enquiriesPreferred;

export function getEnquiriesFilePath() {
  return enquiriesFile;
}
const enquiriesSeedFile = path.join(process.cwd(), "data", "enquiries.seed.json");

function enquiriesLockPath() {
  return path.join(path.dirname(enquiriesFile), ".enquiries-mutation.lock");
}
const brochureFile =
  process.env.BROCHURE_FILE ||
  path.join(process.cwd(), "public", "assets", "minrosh-services-brochure.pdf");

export const contactInbox = "info@minroshmigration.com.au";

export function ensureEnquiriesFile() {
  if (fs.existsSync(enquiriesFile)) return;
  fs.mkdirSync(path.dirname(enquiriesFile), { recursive: true });
  if (fs.existsSync(enquiriesLegacy)) {
    try {
      fs.copyFileSync(enquiriesLegacy, enquiriesFile);
      return;
    } catch {
      /* fall through to seed */
    }
  }
  const seededEntries = readJsonFile(enquiriesSeedFile, []);
  fs.writeFileSync(enquiriesFile, JSON.stringify(seededEntries, null, 2) + "\n", "utf8");
}

export function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

export function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(value, null, 2) + "\n", "utf8");
  fs.renameSync(tempPath, filePath);
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeContact(body = {}) {
  return {
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    preferredCountry: String(body.preferredCountry || "Australia").trim(),
    mainNeed: String(body.mainNeed || "").trim(),
    message: String(body.message || "").trim(),
    quizSummary: String(body.quizSummary || "").trim(),
  };
}

export function validateContact(body) {
  const parsed = parseContactSubmission(body);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  return { value: parsed.value };
}

export function saveEnquiry(contact) {
  withMutationLock(enquiriesLockPath(), () => {
    ensureEnquiriesFile();
    const existing = readJsonFile(enquiriesFile, []);
    existing.unshift(contact);
    writeJsonAtomic(enquiriesFile, existing);
  });
}

function getMailTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass.replace(/\s+/g, ""),
    },
  });
}

export async function sendContactEmails(contact) {
  const transporter = getMailTransport();
  if (!transporter) {
    return { internalSent: false, thankYouSent: false, reason: "smtp_not_configured" };
  }

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const emailTrim = String(contact.email || "").trim();
  const replyTo = emailTrim && isValidEmailLinear(emailTrim) ? emailTrim : undefined;
  const smtpFrom = process.env.SMTP_FROM || contactInbox;
  const brochureExists = fs.existsSync(brochureFile);
  const safeSubjectRef = String(contact.id || "enquiry").replace(/[^\w-]/g, "").slice(0, 40) || "enquiry";

  const internalPayload = {
    from: smtpFrom,
    to: contactInbox,
    subject: `New MinRosh enquiry ${safeSubjectRef}`,
    text: [
      "New MinRosh website enquiry",
      "",
      `ID: ${contact.id}`,
      `Received: ${contact.createdAt}`,
      `Name: ${fullName || "Not provided"}`,
      `Email: ${contact.email || "Not provided (quick enquiry)"}`,
      `Phone: ${contact.phone || "Not provided"}`,
      `Preferred country: ${contact.preferredCountry || "Australia"}`,
      `Main need: ${contact.mainNeed || "Not provided"}`,
      `Quiz summary: ${contact.quizSummary || "Not provided"}`,
      "",
      "Message:",
      contact.message,
    ].join("\n"),
  };
  if (replyTo) {
    internalPayload.replyTo = replyTo;
  }
  await transporter.sendMail(internalPayload);

  let thankYouSent = false;
  if (replyTo) {
    const dearName = contact.firstName || "there";
    const dearHtml = escapeHtmlText(dearName);
    const thankYouHtml = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, Segoe UI, sans-serif; line-height: 1.5; color: #222;">
<p>Dear ${dearHtml},</p>
<p>Thank you for your enquiry. We have received your message and our team will get back to you shortly.</p>
<p>In the meantime, we have attached our latest brochure outlining our key migration services. You can learn more about how we help skilled professionals, families, and students achieve their dream of moving to Australia.</p>
<p>Best regards,<br />The MinRosh Team</p>
</body>
</html>`;
    const thankYouText = [
      `Dear ${dearName},`,
      "",
      "Thank you for your enquiry. We have received your message and our team will get back to you shortly.",
      "",
      "In the meantime, we have attached our latest brochure outlining our key migration services. You can learn more about how we help skilled professionals, families, and students achieve their dream of moving to Australia.",
      "",
      "Best regards,",
      "The MinRosh Team",
    ].join("\n");

    await transporter.sendMail({
      from: smtpFrom,
      to: replyTo,
      subject: "Thank you for contacting MinRosh Migration & Education",
      text: thankYouText,
      html: thankYouHtml,
      attachments: brochureExists
        ? [
            {
              filename: "MinRosh-Migration-Brochure.pdf",
              path: brochureFile,
              contentType: "application/pdf",
            },
          ]
        : [],
    });
    thankYouSent = true;
  }

  return { internalSent: true, thankYouSent, brochureAttached: thankYouSent && brochureExists };
}
