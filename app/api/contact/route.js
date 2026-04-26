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
import { findOrCreateCustomerByIdentity } from "../../../lib/admin/customers-service";
import { dualWriteEnquiryToSupabase } from "@/lib/supabase/enquiries-dual-write";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { hCaptchaEnabledOnServer, verifyHCaptchaToken } from "@/lib/security/hcaptcha";
import { consultationChargeAmountCents, createStripeCheckoutSession, stripeEnabled } from "@/lib/payments/stripe";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`contact:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests. Try again later.", status: 429 }, context);
  }

  const maxBytes = getMaxContactBodyBytes();
  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid request.", status: 400 }, context);
  }
  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON body.", status: 400 }, context);
  }

  const validated = parseContactSubmission(body);
  if (!validated.ok) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: validated.error, status: 400 }, context);
  }

  if (String(process.env.REQUIRE_PRIVACY_CONSENT_ON_CONTACT || "").toLowerCase() === "true") {
    if (validated.value.privacyPolicyAccepted !== true) {
      return apiFail(
        { code: API_ERROR_CODES.VALIDATION_FAILED, message: "Please confirm you have read and accept the privacy policy before submitting.", status: 400 },
        context
      );
    }
  }

  if (hCaptchaEnabledOnServer()) {
    const captchaToken = String(body?.hCaptchaToken || "").trim();
    if (!captchaToken) {
      return apiFail(
        { code: API_ERROR_CODES.VALIDATION_FAILED, message: "Please complete captcha verification before submitting.", status: 400 },
        context
      );
    }
    const verification = await verifyHCaptchaToken({ token: captchaToken, remoteIp: ip });
    if (!verification.ok) {
      return apiFail(
        { code: API_ERROR_CODES.VALIDATION_FAILED, message: "Captcha verification failed. Please retry.", status: 400 },
        context
      );
    }
  }

  const policyVersion = String(process.env.PRIVACY_POLICY_VERSION || "").trim();
  const privacyConsentLog = {
    recordedAt: new Date().toISOString(),
    clientIp: ip,
    policyVersion: policyVersion || null,
    clientConfirmed: validated.value.privacyPolicyAccepted === true,
  };

  const processing = {
    driveFolder: "not_attempted",
    supabaseDualWrite: "not_attempted",
    crmLeadCapture: "not_attempted",
    sheetSync: "not_attempted",
  };
  let leadDrive = { created: false };
  try {
    leadDrive = await createLeadDriveFolder({
      leadId: validated.value.id,
      name: `${validated.value.firstName} ${validated.value.lastName}`.trim(),
    });
    processing.driveFolder = leadDrive.created ? "ok" : "skipped";
  } catch {
    leadDrive = { created: false, reason: "drive_error" };
    processing.driveFolder = "failed";
  }
  const enquiryCore = { ...validated.value };
  delete enquiryCore.privacyPolicyAccepted;
  const enquiryRecord = {
    ...enquiryCore,
    privacyConsentLog,
    leadDriveFolderId: leadDrive.created ? leadDrive.folderId : "",
    leadDriveFolderUrl: leadDrive.created ? leadDrive.folderUrl : "",
  };
  saveEnquiry(enquiryRecord);
  try {
    await dualWriteEnquiryToSupabase(enquiryRecord);
    processing.supabaseDualWrite = "ok";
  } catch {
    /* Supabase dual-write is best-effort */
    processing.supabaseDualWrite = "failed";
  }
  try {
    let customerId = "";
    try {
      const found = findOrCreateCustomerByIdentity({
        name: `${enquiryRecord.firstName} ${enquiryRecord.lastName}`.trim(),
        email: enquiryRecord.email,
        phone: enquiryRecord.phone,
        source: "website_contact_form",
      });
      customerId = String(found?.customer?.id || "").trim();
    } catch {
      customerId = "";
    }
    const lead = createLead({
      customerId: customerId || undefined,
      enquiryId: enquiryRecord.id,
      source: "website_contact",
      firstName: enquiryRecord.firstName,
      lastName: enquiryRecord.lastName,
      email: enquiryRecord.email,
      phone: enquiryRecord.phone,
      preferredCountry: enquiryRecord.preferredCountry,
      mainNeed: enquiryRecord.mainNeed,
      message: enquiryRecord.message,
      referralSource: enquiryRecord.referralSource,
      referralCode: enquiryRecord.referralCode,
      utmSource: enquiryRecord.utmSource,
      bookingType: enquiryRecord.bookingType,
      consultationOffer: enquiryRecord.consultationOffer,
      quizCompleted: Boolean(String(enquiryRecord.quizSummary || "").trim()),
      quizCompletionDepth: String(enquiryRecord.quizSummary || "").trim() ? 10 : 0,
      consultationRequested: Boolean(enquiryRecord.preferredDate && enquiryRecord.preferredTime),
    });
    runAutomationRules({
      trigger: "lead_created",
      payload: { customerId: lead.customerId, leadId: lead.id, pathwaySegment: lead.pathwaySegment },
    });
    processing.crmLeadCapture = "ok";
  } catch {
    /* CRM lead capture is best-effort */
    processing.crmLeadCapture = "failed";
  }
  enqueueNurtureLead(enquiryRecord);
  try {
    await appendLeadToSheet(enquiryRecord);
    processing.sheetSync = "ok";
  } catch {
    // Sheets CRM sync is best-effort and should not block enquiries.
    processing.sheetSync = "failed";
  }
  let calendarResult = { created: false };
  let checkoutUrl = "";
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

  if (hasConsultationSlot && stripeEnabled()) {
    try {
      const amountCents = consultationChargeAmountCents(
        enquiryRecord.consultationDurationMins,
        enquiryRecord.consultationOffer
      );
      if (amountCents > 0) {
        const session = await createStripeCheckoutSession({
          amountCents,
          customerEmail: enquiryRecord.email,
          customerName: `${enquiryRecord.firstName} ${enquiryRecord.lastName}`.trim(),
          metadata: {
            enquiryId: enquiryRecord.id,
            bookingType: enquiryRecord.bookingType || "video",
            offer: enquiryRecord.consultationOffer || "first_15_free",
          },
        });
        if (session.ok) {
          checkoutUrl = session.url;
        }
      }
    } catch {
      checkoutUrl = "";
    }
  }

  try {
    const mailResult = await sendContactEmails(enquiryRecord);
    return apiOk({
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
      checkoutUrl: checkoutUrl || undefined,
      processing,
      warning:
        mailResult.reason === "smtp_not_configured"
          ? "Enquiry saved, but SMTP is not configured yet."
          : calendarWarning,
    }, context);
  } catch {
    return apiOk({
      id: enquiryRecord.id,
      internalSent: false,
      thankYouSent: false,
      consultationBooked: Boolean(calendarResult.created),
      slotAvailable: availabilityResult.available,
      calendarReason: calendarResult.reason || undefined,
      meetUrl: calendarResult.meetUrl || undefined,
      leadDriveFolderId: enquiryRecord.leadDriveFolderId || undefined,
      leadDriveFolderUrl: enquiryRecord.leadDriveFolderUrl || undefined,
      checkoutUrl: checkoutUrl || undefined,
      processing,
      warning: "Enquiry saved, but email delivery could not be completed. We will still review your message.",
    }, context);
  }
}
