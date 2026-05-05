/**
 * Server-side contact validation: linear-time checks, CRLF rejection for header safety.
 */

import { validateConsultationSlot } from "@/lib/consultation-slot-policy";

const MAX_BODY_BYTES = 48 * 1024;

/** Max characters for contact `message` (must match client counters). */
export const MAX_CONTACT_MESSAGE_CHARS = 5000;
/** Max characters for `quizSummary` appended to enquiries. */
export const MAX_CONTACT_QUIZ_SUMMARY_CHARS = 2000;

export const PREFERRED_COUNTRIES = new Set([
  "Australia",
  "New Zealand",
  "Canada",
  "United Kingdom",
]);

export const MAIN_NEEDS = new Set([
  "Skilled Migration",
  "Employer-Sponsored",
  "Student Pathway",
  "Family / Complex Case",
  "Student Visa",
  "Partner Visa",
  "General Enquiry",
]);

const CONSULT_DURATIONS = new Set(["30"]);
const BOOKING_TYPES = new Set(["video", "phone", "in_person"]);

function hasCrLf(s) {
  return /[\r\n]/.test(s);
}

/**
 * Browsers may submit `<input type="time">` as `HH:MM` or `HH:MM:SS` (or `H:MM`).
 * Calendar code expects a strict five-character `HH:MM`.
 * @param {unknown} value
 * @returns {string} normalized `HH:MM` or "" if empty/unparseable
 */
export function normalizePreferredTime(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(\.\d+)?$/.exec(raw);
  if (!m) return "";
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return "";
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Normalize body text: allow newlines; strip lone CR; trim ends only. */
export function normalizeMultilineField(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

/** Linear-time email shape check (no heavy regex). */
export function isValidEmailLinear(value) {
  const v = String(value || "").trim();
  if (!v || v.length > 254) return false;
  if (hasCrLf(v)) return false;
  const at = v.indexOf("@");
  if (at < 1) return false;
  if (v.indexOf("@", at + 1) !== -1) return false;
  const local = v.slice(0, at);
  const domain = v.slice(at + 1);
  if (!local.length || local.length > 64) return false;
  if (!domain.length || domain.length > 253) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  if (!domain.includes(".")) return false;
  const dot = domain.lastIndexOf(".");
  if (dot < 1 || dot === domain.length - 1) return false;
  return true;
}

export function getMaxContactBodyBytes() {
  return MAX_BODY_BYTES;
}

/** @param {unknown} value */
function privacyAcceptedFromBody(value) {
  return value === true || value === "true" || value === "on";
}

/**
 * Quick enquiry: phone + message required; email optional (for SMS-first leads).
 * @param {Record<string, unknown>} body
 */
function parseQuickContactSubmission(body) {
  const hp = body.company ?? body.website ?? body.url;
  if (hp !== undefined && hp !== null && String(hp).trim() !== "") {
    return { ok: false, error: "Invalid request." };
  }

  if (body.message != null && typeof body.message !== "string") {
    return { ok: false, error: "Your enquiry must be plain text." };
  }
  if (body.quizSummary != null && typeof body.quizSummary !== "string") {
    return { ok: false, error: "Quiz summary must be plain text." };
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  let preferredCountry = String(body.preferredCountry ?? "Australia").trim();
  let mainNeed = String(body.mainNeed ?? "General Enquiry").trim();
  const message = normalizeMultilineField(body.message);
  const quizSummary = normalizeMultilineField(body.quizSummary);
  const preferredDate = String(body.preferredDate ?? "").trim();
  const preferredTime = normalizePreferredTime(body.preferredTime);
  const consultationDurationMins = String(body.consultationDurationMins ?? "30").trim();
  const timeZone = String(body.timeZone ?? "Australia/Brisbane").trim();
  const bookingType = String(body.bookingType ?? "video").trim();
  const consultationOffer = String(body.consultationOffer ?? "").trim();
  const referralSource = String(body.referralSource ?? "").trim();
  const referralCode = String(body.referralCode ?? "").trim();
  const utmSource = String(body.utmSource ?? "").trim();

  const headerBoundFields = [
    firstName,
    lastName,
    email,
    phone,
    preferredCountry,
    mainNeed,
    preferredDate,
    preferredTime,
    consultationDurationMins,
    timeZone,
    bookingType,
    consultationOffer,
    referralSource,
    referralCode,
    utmSource,
  ];
  for (const f of headerBoundFields) {
    if (hasCrLf(f)) {
      return { ok: false, error: "Invalid characters in one or more fields." };
    }
  }

  if (!firstName || !phone || !message) {
    return { ok: false, error: "First name, phone, and your enquiry are required." };
  }

  if (
    firstName.length > 100 ||
    lastName.length > 100 ||
    email.length > 200 ||
    phone.length > 50 ||
    message.length > MAX_CONTACT_MESSAGE_CHARS ||
    quizSummary.length > MAX_CONTACT_QUIZ_SUMMARY_CHARS ||
    preferredDate.length > 20 ||
    preferredTime.length > 20 ||
    consultationDurationMins.length > 8 ||
    timeZone.length > 60 ||
    bookingType.length > 20 ||
    consultationOffer.length > 80 ||
    referralSource.length > 120 ||
    referralCode.length > 120 ||
    utmSource.length > 120
  ) {
    return { ok: false, error: "One or more fields are too long." };
  }

  if (email && !isValidEmailLinear(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (!PREFERRED_COUNTRIES.has(preferredCountry)) {
    preferredCountry = "Australia";
  }

  if (!MAIN_NEEDS.has(mainNeed)) {
    mainNeed = "General Enquiry";
  }

  const id = `ENQ-${Date.now()}`;
  const createdAt = new Date().toISOString();

  return {
    ok: true,
    value: {
      id,
      createdAt,
      firstName,
      lastName,
      email,
      phone,
      preferredCountry,
      mainNeed,
      bookingType: BOOKING_TYPES.has(bookingType) ? bookingType : "video",
      consultationOffer,
      message,
      quizSummary,
      referralSource,
      referralCode,
      utmSource,
      privacyPolicyAccepted: privacyAcceptedFromBody(body?.privacyPolicyAccepted),
    },
  };
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, value: object } | { ok: false, error: string }}
 */
export function parseContactSubmission(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
  }

  if (body.quickEnquiry === true) {
    return parseQuickContactSubmission(body);
  }

  const hp = body.company ?? body.website ?? body.url;
  if (hp !== undefined && hp !== null && String(hp).trim() !== "") {
    return { ok: false, error: "Invalid request." };
  }

  if (body.message != null && typeof body.message !== "string") {
    return { ok: false, error: "Your enquiry must be plain text." };
  }
  if (body.quizSummary != null && typeof body.quizSummary !== "string") {
    return { ok: false, error: "Quiz summary must be plain text." };
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  let preferredCountry = String(body.preferredCountry ?? "Australia").trim();
  let mainNeed = String(body.mainNeed ?? "").trim();
  const preferredDate = String(body.preferredDate ?? "").trim();
  const preferredTime = normalizePreferredTime(body.preferredTime);
  const consultationDurationMins = String(body.consultationDurationMins ?? "30").trim();
  const timeZone = String(body.timeZone ?? "Australia/Brisbane").trim();
  const bookingType = String(body.bookingType ?? "video").trim();
  const consultationOffer = String(body.consultationOffer ?? "").trim();
  const referralSource = String(body.referralSource ?? "").trim();
  const referralCode = String(body.referralCode ?? "").trim();
  const utmSource = String(body.utmSource ?? "").trim();
  const message = normalizeMultilineField(body.message);
  const quizSummary = normalizeMultilineField(body.quizSummary);

  const headerBoundFields = [
    firstName,
    lastName,
    email,
    phone,
    preferredCountry,
    mainNeed,
    preferredDate,
    preferredTime,
    consultationDurationMins,
    timeZone,
    bookingType,
    consultationOffer,
    referralSource,
    referralCode,
    utmSource,
  ];
  for (const f of headerBoundFields) {
    if (hasCrLf(f)) {
      return { ok: false, error: "Invalid characters in one or more fields." };
    }
  }

  if (!firstName || !email || !message) {
    return { ok: false, error: "First name, email, and your enquiry are required." };
  }

  if (
    firstName.length > 100 ||
    lastName.length > 100 ||
    email.length > 200 ||
    phone.length > 50 ||
    message.length > MAX_CONTACT_MESSAGE_CHARS ||
    quizSummary.length > MAX_CONTACT_QUIZ_SUMMARY_CHARS ||
    preferredDate.length > 20 ||
    preferredTime.length > 20 ||
    consultationDurationMins.length > 8 ||
    timeZone.length > 60 ||
    bookingType.length > 20 ||
    consultationOffer.length > 80 ||
    referralSource.length > 120 ||
    referralCode.length > 120 ||
    utmSource.length > 120
  ) {
    return { ok: false, error: "One or more fields are too long." };
  }

  if (!isValidEmailLinear(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (!PREFERRED_COUNTRIES.has(preferredCountry)) {
    preferredCountry = "Australia";
  }

  if (!MAIN_NEEDS.has(mainNeed)) {
    mainNeed = "Family / Complex Case";
  }

  const hasConsultationPreference = preferredDate || preferredTime || body.bookConsultation === true;
  if (hasConsultationPreference) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      return { ok: false, error: "Please select a valid consultation date." };
    }
    if (!/^\d{2}:\d{2}$/.test(preferredTime)) {
      return { ok: false, error: "Please select a valid consultation time." };
    }
  }
  if (preferredDate && preferredTime) {
    const slotCheck = validateConsultationSlot({
      preferredDate,
      preferredTime,
      timeZone,
      slotDurationMins: Number(consultationDurationMins),
    });
    if (!slotCheck.ok) {
      return { ok: false, error: slotCheck.error };
    }
  }
  const safeDuration = CONSULT_DURATIONS.has(consultationDurationMins) ? consultationDurationMins : "30";
  const safeTimeZone = timeZone || "Australia/Brisbane";
  const safeBookingType = BOOKING_TYPES.has(bookingType) ? bookingType : "video";

  const id = `ENQ-${Date.now()}`;
  const createdAt = new Date().toISOString();

  return {
    ok: true,
    value: {
      id,
      createdAt,
      firstName,
      lastName,
      email,
      phone,
      preferredCountry,
      mainNeed,
      preferredDate,
      preferredTime,
      consultationDurationMins: safeDuration,
      timeZone: safeTimeZone,
      bookingType: safeBookingType,
      consultationOffer,
      message,
      quizSummary,
      referralSource,
      referralCode,
      utmSource,
      privacyPolicyAccepted: privacyAcceptedFromBody(body?.privacyPolicyAccepted),
    },
  };
}
