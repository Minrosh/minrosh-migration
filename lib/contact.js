/**
 * Enquiries and shared JSON helpers. Website submissions are also mirrored to Supabase
 * `enquiries_mirror` when configured (see `lib/supabase/enquiries-dual-write.js`).
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
  const quizSummaryLine = String(contact.quizSummary || "").trim();
  /** Guided flows from /assessment (Smart Navigator) carry this quizSummary prefix via navigator-session. */
  const completedGuidedAssessment =
    quizSummaryLine.startsWith("Smart Navigator:") || /assessment/i.test(String(contact.mainNeed || ""));
  const safeSubjectRef = String(contact.id || "enquiry").replace(/[^\w-]/g, "").slice(0, 40) || "enquiry";
  const subjectName = fullName || "Unknown visitor";

  const internalPayload = {
    from: smtpFrom,
    to: contactInbox,
    subject: `New MinRosh enquiry: ${subjectName} (${safeSubjectRef})`,
    text: [
      "New MinRosh website enquiry (Brisbane-based registered migration agents)",
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
    html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1f1020;">
  <h2 style="margin:0 0 12px;">New MinRosh Website Enquiry</h2>
  <table style="border-collapse:collapse;width:100%;max-width:760px;margin-bottom:16px;">
    <tr>
      <th style="text-align:left;padding:8px;border:1px solid #e5d8dc;background:#fbf6f4;">Field</th>
      <th style="text-align:left;padding:8px;border:1px solid #e5d8dc;background:#fbf6f4;">Value</th>
    </tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">ID</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.id || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Received</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.createdAt || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Name</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(fullName || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Email</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.email || "Not provided (quick enquiry)")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Phone</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.phone || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Preferred country</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.preferredCountry || "Australia")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Main need</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.mainNeed || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Preferred consultation date</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.preferredDate || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Preferred consultation time</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.preferredTime || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Consultation duration</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(String(contact.consultationDurationMins || "Not provided"))} minutes</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Time zone</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.timeZone || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Quiz summary</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.quizSummary || "Not provided")}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Resume</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(
      contact.resumeUploadStatus === "uploaded" && contact.resumeFileName
        ? `uploaded (${contact.resumeFileName})`
        : contact.resumeUploadStatus === "failed"
          ? "upload failed (see server logs)"
          : "not provided"
    )}</td></tr>
    <tr><td style="padding:8px;border:1px solid #e5d8dc;">Lead Drive folder</td><td style="padding:8px;border:1px solid #e5d8dc;">${escapeHtmlText(contact.leadDriveFolderUrl || "Not created")}</td></tr>
  </table>
  <h3 style="margin:0 0 8px;">Message</h3>
  <p style="margin:0;white-space:pre-wrap;">${escapeHtmlText(contact.message || "Not provided")}</p>
</body>
</html>`,
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
    const brochureNoteHtml = !brochureExists
      ? "<p>You can read more about our Brisbane-based team on minroshmigration.com.au at any time.</p>"
      : completedGuidedAssessment
        ? "<p>Thank you for completing our guided assessment. We’ve attached a PDF overview of our Brisbane-based migration and education services for your records.</p>"
        : "<p>We’ve attached a PDF overview of our Brisbane-based migration and education services.</p>";
    const brochureNoteText = !brochureExists
      ? "You can read more about our Brisbane-based team on minroshmigration.com.au at any time."
      : completedGuidedAssessment
        ? "Thank you for completing our guided assessment. We’ve attached a PDF overview of our Brisbane-based migration and education services for your records."
        : "We’ve attached a PDF overview of our Brisbane-based migration and education services.";
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
<p>Thank you for your enquiry. Our Brisbane-based team has received your message and will respond during business hours (AEST) whenever you requested a reply.</p>
${slotLinesHtml}
${brochureNoteHtml}
<p>Best regards,<br />The MinRosh Migration team — Brisbane, Australia</p>
</body>
</html>`;
    const thankYouText = [
      `Dear ${dearName},`,
      "",
      "Thank you for your enquiry. Our Brisbane-based team has received your message and will respond during business hours (AEST) whenever you requested a reply.",
      "",
      ...(slotLinesText ? [slotLinesText, ""] : []),
      brochureNoteText,
      "",
      "Best regards,",
      "The MinRosh Migration team — Brisbane, Australia",
    ].join("\n");

    try {
      await withSmtpDeadline(
        transporter.sendMail({
          from: smtpFrom,
          to: replyTo,
          subject: "Thank you — MinRosh Migration (Brisbane)",
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
