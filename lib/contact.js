/**
 * Enquiries and shared JSON helpers. For production scale, plan to move enquiries and related
 * records to a database for concurrency, backups, and audit trails.
 */
import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { withMutationLock } from "./json-mutation-lock";
import { isValidEmailLinear, parseContactSubmission } from "./validation/contact-schema";
import { getBrochureAttachments } from "./brochure-path";
import { smtpSocketTimeoutFields, withSmtpDeadline } from "./smtp-timeout";

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
export const contactInbox = "info@minroshmigration.com.au";

/** @param {unknown} err */
function classifySmtpFailure(err) {
  const code = String(/** @type {{ code?: string }} */ (err)?.code || "");
  const msg = String(/** @type {{ message?: string }} */ (err)?.message || "").toLowerCase();
  if (code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT" || msg.includes("timed out") || msg.includes("timeout")) {
    return "smtp_timeout";
  }
  return "smtp_error";
}

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
    preferredDate: String(body.preferredDate || "").trim(),
    preferredTime: String(body.preferredTime || "").trim(),
    consultationDurationMins: String(body.consultationDurationMins || "30").trim(),
    timeZone: String(body.timeZone || "Australia/Brisbane").trim(),
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

/**
 * @param {object} contact
 * @param {{ dedupeById?: boolean }} [options] — when dedupeById and contact.id already exists, skip write
 * @returns {{ saved: boolean } | void} — returns when dedupeById is true
 */
export function saveEnquiry(contact, options = {}) {
  const dedupeById = options.dedupeById === true;
  const result = withMutationLock(enquiriesLockPath(), () => {
    ensureEnquiriesFile();
    const existing = readJsonFile(enquiriesFile, []);
    if (dedupeById && contact?.id) {
      if (existing.some((e) => e.id === contact.id)) {
        return { saved: false };
      }
    }
    existing.unshift(contact);
    writeJsonAtomic(enquiriesFile, existing);
    return { saved: true };
  });
  if (dedupeById) return result;
}

export function getMailTransport() {
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
    ...smtpSocketTimeoutFields(),
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
  const brochureAttachments = getBrochureAttachments();
  const brochureExists = brochureAttachments.length > 0;
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
      `Preferred consultation date: ${contact.preferredDate || "Not provided"}`,
      `Preferred consultation time: ${contact.preferredTime || "Not provided"}`,
      `Consultation duration: ${contact.consultationDurationMins || "Not provided"} minutes`,
      `Time zone: ${contact.timeZone || "Not provided"}`,
      `Quiz summary: ${contact.quizSummary || "Not provided"}`,
      `Resume: ${
        contact.resumeUploadStatus === "uploaded" && contact.resumeFileName
          ? `uploaded (${contact.resumeFileName})`
          : contact.resumeUploadStatus === "failed"
            ? "upload failed (see server logs)"
            : "not provided"
      }`,
      `Lead Drive folder: ${contact.leadDriveFolderUrl || "Not created"}`,
      "",
      "Message:",
      contact.message,
    ].join("\n"),
  };
  if (replyTo) {
    internalPayload.replyTo = replyTo;
  }
  try {
    await withSmtpDeadline(transporter.sendMail(internalPayload));
  } catch (err) {
    console.error("sendContactEmails internal sendMail:", err);
    return {
      internalSent: false,
      thankYouSent: false,
      brochureAttached: false,
      reason: classifySmtpFailure(err),
    };
  }

  let thankYouSent = false;
  if (replyTo) {
    const dearName = contact.firstName || "there";
    const dearHtml = escapeHtmlText(dearName);
    const brochureNoteHtml = brochureExists
      ? "<p>In the meantime, we have attached a short overview brochure about our migration and education services.</p>"
      : "<p>You can read more about how we help on our website at any time.</p>";
    const brochureNoteText = brochureExists
      ? "In the meantime, we have attached a short overview brochure about our migration and education services."
      : "You can read more about how we help on our website at any time.";
    const hasSlot = Boolean(String(contact.preferredDate || "").trim() && String(contact.preferredTime || "").trim());
    const bookingTypeLabel = String(contact.bookingType || "").trim();
    const slotLinesText = hasSlot
      ? [
          "Consultation request (please confirm with us if payment or calendar steps are still pending):",
          `- Preferred date: ${contact.preferredDate}`,
          `- Preferred time (${contact.timeZone || "time zone"}): ${contact.preferredTime}`,
          `- Length: ${contact.consultationDurationMins || "30"} minutes`,
          bookingTypeLabel ? `- Type: ${bookingTypeLabel}` : "",
          String(contact.quizSummary || "").trim()
            ? `- Points / navigator summary: ${String(contact.quizSummary).trim()}`
            : "",
          contact.resumeUploadStatus === "uploaded" && contact.resumeFileName
            ? `- Resume: we received your file (${String(contact.resumeFileName).trim()}).`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";
    const slotLinesHtml = hasSlot
      ? `<p><strong>Consultation request</strong> (confirm with us if payment or calendar steps are still pending):</p><ul>${[
          `<li>Preferred date: ${escapeHtmlText(contact.preferredDate)}</li>`,
          `<li>Preferred time (${escapeHtmlText(contact.timeZone || "")}): ${escapeHtmlText(contact.preferredTime)}</li>`,
          `<li>Length: ${escapeHtmlText(String(contact.consultationDurationMins || "30"))} minutes</li>`,
          bookingTypeLabel ? `<li>Type: ${escapeHtmlText(bookingTypeLabel)}</li>` : "",
          String(contact.quizSummary || "").trim()
            ? `<li>Points / navigator summary: ${escapeHtmlText(String(contact.quizSummary).trim())}</li>`
            : "",
          contact.resumeUploadStatus === "uploaded" && contact.resumeFileName
            ? `<li>Resume: we received your file (${escapeHtmlText(String(contact.resumeFileName).trim())}).</li>`
            : "",
        ]
          .filter(Boolean)
          .join("")}</ul>`
      : "";
    const thankYouHtml = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, Segoe UI, sans-serif; line-height: 1.5; color: #222;">
<p>Dear ${dearHtml},</p>
<p>Thank you for your enquiry. We have received your message and our team will get back to you shortly.</p>
${slotLinesHtml}
${brochureNoteHtml}
<p>Best regards,<br />The MinRosh Team</p>
</body>
</html>`;
    const thankYouText = [
      `Dear ${dearName},`,
      "",
      "Thank you for your enquiry. We have received your message and our team will get back to you shortly.",
      "",
      ...(slotLinesText ? [slotLinesText, ""] : []),
      brochureNoteText,
      "",
      "Best regards,",
      "The MinRosh Team",
    ].join("\n");

    try {
      await withSmtpDeadline(
        transporter.sendMail({
          from: smtpFrom,
          to: replyTo,
          subject: "Thank you for contacting MinRosh Migration & Education",
          text: thankYouText,
          html: thankYouHtml,
          attachments: brochureAttachments,
        })
      );
      thankYouSent = true;
    } catch (err) {
      console.error("sendContactEmails thank-you sendMail:", err);
      return {
        internalSent: true,
        thankYouSent: false,
        brochureAttached: false,
        reason: "smtp_thankyou_failed",
        thankYouFailure: classifySmtpFailure(err),
      };
    }
  }

  return { internalSent: true, thankYouSent, brochureAttached: thankYouSent && brochureExists };
}
