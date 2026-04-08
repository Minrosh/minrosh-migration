import { saveEnquiry, sendContactEmails } from "../../../lib/contact";
import { parseContactSubmission, getMaxContactBodyBytes } from "../../../lib/validation/contact-schema";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";
import { checkConsultationAvailability, createConsultationCalendarEvent } from "../../../lib/google-calendar";
import { createLeadDriveFolder } from "../../../lib/google-drive";
import { enqueueNurtureLead } from "../../../lib/nurture-sequences";
import { appendLeadToSheet } from "../../../lib/google-sheets-crm";
import { createLead } from "../../../lib/crm/leads-service";
import { runAutomationRules } from "../../../lib/crm/automation-runner";

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`contact:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const maxBytes = getMaxContactBodyBytes();
  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = parseContactSubmission(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  let leadDrive = { created: false };
  try {
    leadDrive = await createLeadDriveFolder({
      leadId: validated.value.id,
      name: `${validated.value.firstName} ${validated.value.lastName}`.trim(),
    });
  } catch {
    leadDrive = { created: false, reason: "drive_error" };
  }
  const enquiryRecord = {
    ...validated.value,
    leadDriveFolderId: leadDrive.created ? leadDrive.folderId : "",
    leadDriveFolderUrl: leadDrive.created ? leadDrive.folderUrl : "",
  };
  saveEnquiry(enquiryRecord);
  try {
    const lead = createLead({
      enquiryId: enquiryRecord.id,
      source: "website_contact",
      firstName: enquiryRecord.firstName,
      lastName: enquiryRecord.lastName,
      email: enquiryRecord.email,
      phone: enquiryRecord.phone,
      mainNeed: enquiryRecord.mainNeed,
      message: enquiryRecord.message,
      quizCompleted: Boolean(String(enquiryRecord.quizSummary || "").trim()),
      quizCompletionDepth: String(enquiryRecord.quizSummary || "").trim() ? 10 : 0,
      consultationRequested: Boolean(enquiryRecord.preferredDate && enquiryRecord.preferredTime),
    });
    runAutomationRules({ trigger: "lead_created", payload: { customerId: lead.customerId } });
  } catch {
    /* CRM lead capture is best-effort */
  }
  enqueueNurtureLead(enquiryRecord);
  try {
    await appendLeadToSheet(enquiryRecord);
  } catch {
    // Sheets CRM sync is best-effort and should not block enquiries.
  }
  let calendarResult = { created: false };
  let availabilityResult = { available: true, checked: false };
  const hasConsultationSlot =
    validated.value.preferredDate && validated.value.preferredTime && validated.value.email;
  if (hasConsultationSlot) {
    try {
      availabilityResult = await checkConsultationAvailability(validated.value);
      if (availabilityResult.available) {
        calendarResult = await createConsultationCalendarEvent(validated.value);
      } else {
        calendarResult = { created: false, reason: "slot_unavailable" };
      }
    } catch {
      calendarResult = { created: false, reason: "calendar_error" };
    }
  }

  const calendarWarning =
    !hasConsultationSlot
      ? undefined
      : !availabilityResult.available
        ? "Selected consultation time is no longer available. Please choose another slot."
      : calendarResult.reason === "google_calendar_not_configured"
        ? "Consultation booking is currently offline (calendar not configured). Your enquiry is saved and our team will confirm manually."
      : calendarResult.reason === "calendar_error"
        ? "Enquiry saved, but calendar provider is temporarily unavailable. We will confirm your slot manually."
      : !calendarResult.created
        ? "Enquiry saved, but calendar booking could not be created."
      : undefined;

  try {
    const mailResult = await sendContactEmails(enquiryRecord);
    return Response.json({
      ok: true,
      id: enquiryRecord.id,
      internalSent: mailResult.internalSent,
      thankYouSent: mailResult.thankYouSent,
      brochureAttached: mailResult.brochureAttached || false,
      consultationBooked: Boolean(calendarResult.created),
      slotAvailable: availabilityResult.available,
      calendarReason: calendarResult.reason || undefined,
      meetUrl: calendarResult.meetUrl || undefined,
      leadDriveFolderId: enquiryRecord.leadDriveFolderId || undefined,
      leadDriveFolderUrl: enquiryRecord.leadDriveFolderUrl || undefined,
      warning:
        mailResult.reason === "smtp_not_configured"
          ? "Enquiry saved, but SMTP is not configured yet."
          : calendarWarning,
    });
  } catch {
    return Response.json({
      ok: true,
      id: enquiryRecord.id,
      internalSent: false,
      thankYouSent: false,
      consultationBooked: Boolean(calendarResult.created),
      slotAvailable: availabilityResult.available,
      calendarReason: calendarResult.reason || undefined,
      meetUrl: calendarResult.meetUrl || undefined,
      leadDriveFolderId: enquiryRecord.leadDriveFolderId || undefined,
      leadDriveFolderUrl: enquiryRecord.leadDriveFolderUrl || undefined,
      warning: "Enquiry saved, but email delivery could not be completed. We will still review your message.",
    });
  }
}
