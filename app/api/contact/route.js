import { saveEnquiry, sendContactEmails } from "../../../lib/contact";
import { parseContactSubmission, getMaxContactBodyBytes } from "../../../lib/validation/contact-schema";
import { contactFieldsFromFormData } from "@/lib/contact-form-data";
import { uploadConsultationResumeIfPresent } from "@/lib/contact-resume-upload";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";
import { checkConsultationAvailability, createConsultationCalendarEvent } from "../../../lib/google-calendar";
import { createLeadDriveFolder } from "../../../lib/google-drive";
import { enqueueNurtureLead } from "../../../lib/nurture-sequences";
import { appendLeadToSheet, resolveSheetSyncStatus } from "../../../lib/google-sheets-crm";
import { createLead } from "../../../lib/crm/leads-service";
import { runAutomationRules } from "../../../lib/crm/automation-runner";
import { findOrCreateCustomerByIdentity } from "../../../lib/admin/customers-service";
import { dualWriteEnquiryToSupabase } from "@/lib/supabase/enquiries-dual-write";
import { obsLogger } from "@/lib/observability/logger";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { hCaptchaEnabledOnServer, verifyHCaptchaToken } from "@/lib/security/hcaptcha";
import { consultationChargeAmountCents, createStripeCheckoutSession, stripeEnabled } from "@/lib/payments/stripe";
import {
  DEFAULT_COMPLIANCE,
  getComplianceConfig,
  looksLikeImmigrationAssistanceRequest,
} from "@/lib/compliance";
import siteData from "../../../data/site.json";

const MULTIPART_MAX_BYTES = 18 * 1024 * 1024;
/** Public contact forms do not accept migration/resume document uploads. */
const PUBLIC_RESUME_UPLOADS_ENABLED = false;

/**
 * Public contact success payload — omits integration telemetry and internal folder IDs.
 * @param {Record<string, unknown>} fields
 */
function publicContactSuccessPayload(fields) {
  const {
    id,
    ok,
    outcome,
    restrictedEnquiryMessage,
    warning,
    internalSent,
    thankYouSent,
    brochureAttached,
    consultationBooked,
    slotAvailable,
    meetUrl,
    checkoutUrl,
  } = fields;
  return {
    ...(id != null ? { id } : {}),
    ...(ok != null ? { ok } : {}),
    ...(outcome != null ? { outcome } : {}),
    ...(restrictedEnquiryMessage != null ? { restrictedEnquiryMessage } : {}),
    ...(warning != null ? { warning } : {}),
    ...(internalSent != null ? { internalSent } : {}),
    ...(thankYouSent != null ? { thankYouSent } : {}),
    ...(brochureAttached != null ? { brochureAttached } : {}),
    ...(consultationBooked != null ? { consultationBooked } : {}),
    ...(slotAvailable != null ? { slotAvailable } : {}),
    ...(meetUrl ? { meetUrl } : {}),
    ...(checkoutUrl ? { checkoutUrl } : {}),
  };
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`contact:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests. Try again later.", status: 429 }, context);
  }

  const compliance = getComplianceConfig(siteData);
  const contentType = String(request.headers.get("content-type") || "");
  const isMultipart = contentType.includes("multipart/form-data");

  let body;
  /** @type {File | null} */
  let resumeFile = null;

  if (isMultipart) {
    const cl = request.headers.get("content-length");
    if (cl) {
      const n = Number(cl);
      if (Number.isFinite(n) && n > MULTIPART_MAX_BYTES) {
        return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
      }
    }
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid multipart body.", status: 400 }, context);
    }
    body = contactFieldsFromFormData(formData);
    const r = formData.get("resume");
    if (r && typeof r === "object" && "arrayBuffer" in r && typeof r.arrayBuffer === "function") {
      const f = /** @type {File} */ (r);
      if (f.size > 0) {
        if (!PUBLIC_RESUME_UPLOADS_ENABLED) {
          return apiFail(
            {
              code: API_ERROR_CODES.VALIDATION_FAILED,
              message:
                "Document uploads are not accepted on public enquiry forms. Please do not send passports, visas, or migration documents.",
              status: 400,
            },
            context
          );
        }
        resumeFile = f;
      }
    }
  } else {
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
    try {
      body = JSON.parse(rawText);
    } catch {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON body.", status: 400 }, context);
    }
  }

  const validated = parseContactSubmission(body);
  if (!validated.ok) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: validated.error, status: 400 }, context);
  }

  if (validated.value.formAcknowledgementAccepted !== true) {
    return apiFail(
      {
        code: API_ERROR_CODES.VALIDATION_FAILED,
        message: "Please confirm the acknowledgement before submitting.",
        status: 400,
      },
      context
    );
  }

  if (String(process.env.REQUIRE_PRIVACY_CONSENT_ON_CONTACT || "").toLowerCase() === "true") {
    if (validated.value.privacyPolicyAccepted !== true) {
      return apiFail(
        {
          code: API_ERROR_CODES.VALIDATION_FAILED,
          message: "Please confirm you have read and accept the privacy policy before submitting.",
          status: 400,
        },
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

  const restrictedMessage =
    compliance.restrictedEnquiryMessage || DEFAULT_COMPLIANCE.restrictedEnquiryMessage;
  if (looksLikeImmigrationAssistanceRequest(validated.value.message)) {
    const policyVersionEarly = String(process.env.PRIVACY_POLICY_VERSION || "").trim();
    const privacyConsentLogEarly = {
      recordedAt: new Date().toISOString(),
      clientIp: ip,
      policyVersion: policyVersionEarly || null,
      clientConfirmed: validated.value.privacyPolicyAccepted === true,
    };
    const enquiryCoreEarly = { ...validated.value };
    delete enquiryCoreEarly.privacyPolicyAccepted;
    delete enquiryCoreEarly.formAcknowledgementAccepted;
    const restrictedRecord = {
      ...enquiryCoreEarly,
      privacyConsentLog: privacyConsentLogEarly,
      outcome: "referred_to_authorised_professional",
      resumeUploadStatus: "not_accepted",
      resumeFileName: "",
      leadDriveFolderId: "",
      leadDriveFolderUrl: "",
    };
    saveEnquiry(restrictedRecord);
    try {
      await sendContactEmails({
        ...restrictedRecord,
        message: `[RESTRICTED — referred to authorised professional]\n\n${restrictedRecord.message}`,
      });
    } catch {
      /* best-effort */
    }
    return apiOk(
      publicContactSuccessPayload({
        id: restrictedRecord.id,
        ok: true,
        outcome: "referred_to_authorised_professional",
        restrictedEnquiryMessage: restrictedMessage,
        warning: restrictedMessage,
        internalSent: false,
        thankYouSent: false,
        consultationBooked: false,
      }),
      context
    );
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

  const folderId = leadDrive.created ? leadDrive.folderId : "";
  const resumeResult =
    PUBLIC_RESUME_UPLOADS_ENABLED && resumeFile
      ? await uploadConsultationResumeIfPresent({
          resumeFile,
          folderId: String(folderId || "").trim(),
          enquiryId: validated.value.id,
        })
      : { status: "not_accepted", fileName: "" };

  const enquiryCore = { ...validated.value };
  delete enquiryCore.privacyPolicyAccepted;
  delete enquiryCore.formAcknowledgementAccepted;
  const enquiryRecord = {
    ...enquiryCore,
    privacyConsentLog,
    leadDriveFolderId: leadDrive.created ? leadDrive.folderId : "",
    leadDriveFolderUrl: leadDrive.created ? leadDrive.folderUrl : "",
    resumeUploadStatus: resumeResult.status,
    resumeFileName: resumeResult.fileName || "",
  };

  saveEnquiry(enquiryRecord);
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
    const sheetResult = await appendLeadToSheet(enquiryRecord);
    processing.sheetSync = resolveSheetSyncStatus(sheetResult);
  } catch {
    // Sheets CRM sync is best-effort and should not block enquiries.
    processing.sheetSync = "failed";
  }
  let calendarResult = { created: false };
  let checkoutUrl = "";
  let availabilityResult = { available: true, checked: false };
  const hasConsultationSlot =
    enquiryRecord.preferredDate && enquiryRecord.preferredTime && enquiryRecord.email;
  if (hasConsultationSlot) {
    try {
      availabilityResult = await checkConsultationAvailability(enquiryRecord);
      if (availabilityResult.available) {
        calendarResult = await createConsultationCalendarEvent(enquiryRecord);
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

  /**
   * Supabase mirror upsert runs immediately before SMTP (never after): email delivery must not precede DB backup.
   * Payload includes calendar/checkout snapshot when consultation fields are present.
   */
  const enquiryMirrorPayload = {
    ...enquiryRecord,
    processingSnapshot: {
      consultationBooked: Boolean(calendarResult.created),
      meetUrl: calendarResult.meetUrl || "",
      calendarReason: calendarResult.reason || "",
      checkoutUrl: checkoutUrl || "",
      slotAvailable: availabilityResult.available,
    },
  };
  const supabaseResult = await dualWriteEnquiryToSupabase(enquiryMirrorPayload);
  if (supabaseResult.skipped) {
    processing.supabaseDualWrite = supabaseResult.ok ? "skipped_env" : "skipped";
  } else {
    processing.supabaseDualWrite = supabaseResult.ok ? "ok" : "failed";
  }
  const supabasePersisted = Boolean(supabaseResult.ok && !supabaseResult.skipped);

  if (!supabaseResult.ok) {
    obsLogger.error("contact_supabase_dual_write_failed_pre_email", {
      enquiryId: enquiryRecord.id,
      reason: String(supabaseResult.error || "unknown"),
    });
    return apiFail(
      {
        code: API_ERROR_CODES.UPSTREAM_ERROR,
        message:
          "Your enquiry could not be saved to our secure records right now, so we have not sent emails yet. Please retry in a few minutes.",
        status: 503,
        details: {
          reason: supabaseResult.error || "supabase_dual_write_failed",
          enquiryId: enquiryRecord.id,
        },
      },
      context
    );
  }

  const mailResult = await sendContactEmails(enquiryRecord);

  obsLogger.info("contact_processing_snapshot", {
    enquiryId: enquiryRecord.id,
    sheetSync: processing.sheetSync,
    driveFolder: processing.driveFolder,
    crmLeadCapture: processing.crmLeadCapture,
    supabaseDualWrite: processing.supabaseDualWrite,
  });

  if (!mailResult.internalSent) {
    if (mailResult.reason === "smtp_not_configured") {
      return apiOk(
        publicContactSuccessPayload({
          id: enquiryRecord.id,
          internalSent: false,
          thankYouSent: false,
          brochureAttached: false,
          consultationBooked: Boolean(calendarResult.created),
          slotAvailable: availabilityResult.available,
          meetUrl: calendarResult.meetUrl || undefined,
          checkoutUrl: checkoutUrl || undefined,
          warning: "Enquiry saved, but SMTP is not configured yet.",
        }),
        context
      );
    }
    if (supabasePersisted) {
      obsLogger.warn("contact_internal_mail_failed_after_supabase", {
        enquiryId: enquiryRecord.id,
        reason: mailResult.reason || "smtp_error",
      });
      console.error("[contact] internal mail failed after enquiries_mirror success", {
        enquiryId: enquiryRecord.id,
        reason: mailResult.reason,
      });
      const mailDownWarning =
        "Your enquiry was received and stored securely. Our email notification is delayed; we will still follow up using the details you provided.";
      return apiOk(
        publicContactSuccessPayload({
          id: enquiryRecord.id,
          internalSent: false,
          thankYouSent: false,
          brochureAttached: false,
          consultationBooked: Boolean(calendarResult.created),
          slotAvailable: availabilityResult.available,
          meetUrl: calendarResult.meetUrl || undefined,
          checkoutUrl: checkoutUrl || undefined,
          warning: mailDownWarning,
        }),
        context
      );
    }
    return apiFail(
      {
        code: API_ERROR_CODES.MAIL_DELIVERY_FAILED,
        message:
          "We could not deliver your enquiry by email right now. Please try again in a few minutes, or phone or email us directly.",
        status: 503,
        details: {
          reason: mailResult.reason || "smtp_error",
          enquiryId: enquiryRecord.id,
        },
      },
      context
    );
  }

  const mailWarning =
    mailResult.reason === "smtp_thankyou_failed"
      ? "We received your enquiry, but the automatic confirmation email could not be sent. We will still reply using the contact details you provided."
      : calendarWarning;

  return apiOk(
    publicContactSuccessPayload({
      id: enquiryRecord.id,
      internalSent: mailResult.internalSent,
      thankYouSent: mailResult.thankYouSent,
      brochureAttached: mailResult.brochureAttached || false,
      consultationBooked: Boolean(calendarResult.created),
      slotAvailable: availabilityResult.available,
      meetUrl: calendarResult.meetUrl || undefined,
      checkoutUrl: checkoutUrl || undefined,
      warning: mailWarning,
    }),
    context
  );
}
