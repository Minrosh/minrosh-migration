import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const enquiriesFile =
  process.env.ENQUIRIES_FILE || path.join(process.cwd(), "data-enquiries.json");
const brochureFile =
  process.env.BROCHURE_FILE ||
  path.join(process.cwd(), "public", "assets", "minrosh-services-brochure.pdf");

export const contactInbox = "info@minroshmigration.com.au";

export function ensureEnquiriesFile() {
  if (!fs.existsSync(enquiriesFile)) {
    fs.writeFileSync(enquiriesFile, "[]\n", "utf8");
  }
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
  const value = normalizeContact(body);

  if (!value.firstName || !value.email || !value.message) {
    return { error: "First name, email, and your enquiry are required." };
  }

  if (
    value.firstName.length > 100 ||
    value.lastName.length > 100 ||
    value.email.length > 200 ||
    value.message.length > 5000 ||
    value.quizSummary.length > 2000
  ) {
    return { error: "One or more fields are too long." };
  }

  value.id = `ENQ-${Date.now()}`;
  value.createdAt = new Date().toISOString();
  return { value };
}

export function saveEnquiry(contact) {
  ensureEnquiriesFile();
  const existing = readJsonFile(enquiriesFile, []);
  existing.unshift(contact);
  writeJsonAtomic(enquiriesFile, existing);
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
      pass: smtpPass,
    },
  });
}

export async function sendContactEmails(contact) {
  const transporter = getMailTransport();
  if (!transporter) {
    return { internalSent: false, thankYouSent: false, reason: "smtp_not_configured" };
  }

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const replyTo = contact.email;
  const smtpFrom = process.env.SMTP_FROM || contactInbox;
  const brochureExists = fs.existsSync(brochureFile);

  await transporter.sendMail({
    from: smtpFrom,
    to: contactInbox,
    replyTo,
    subject: `New MinRosh enquiry from ${fullName || contact.email}`,
    text: [
      "New MinRosh website enquiry",
      "",
      `ID: ${contact.id}`,
      `Received: ${contact.createdAt}`,
      `Name: ${fullName || "Not provided"}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone || "Not provided"}`,
      `Preferred country: ${contact.preferredCountry || "Australia"}`,
      `Main need: ${contact.mainNeed || "Not provided"}`,
      `Quiz summary: ${contact.quizSummary || "Not provided"}`,
      "",
      "Message:",
      contact.message,
    ].join("\n"),
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: contact.email,
    subject: "Thank you for contacting MinRosh Migration",
    text: [
      `Hi ${contact.firstName || "there"},`,
      "",
      "Thank you for contacting MinRosh Migration.",
      "We have received your enquiry and will review your details shortly.",
      "",
      "If your matter is time-sensitive, you can also message us on WhatsApp at +61 478 100 542.",
      "",
      "Regards,",
      "MinRosh Migration",
    ].join("\n"),
    attachments: brochureExists
      ? [
          {
            filename: "minrosh-services-brochure.pdf",
            path: brochureFile,
          },
        ]
      : [],
  });

  return { internalSent: true, thankYouSent: true, brochureAttached: brochureExists };
}
