/**
 * Server-side contact validation: linear-time checks, CRLF rejection for header safety.
 */

const MAX_BODY_BYTES = 48 * 1024;

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
]);

function hasCrLf(s) {
  return /[\r\n]/.test(s);
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

/**
 * @param {unknown} body
 * @returns {{ ok: true, value: object } | { ok: false, error: string }}
 */
export function parseContactSubmission(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
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
  const message = normalizeMultilineField(body.message);
  const quizSummary = normalizeMultilineField(body.quizSummary);

  const headerBoundFields = [firstName, lastName, email, phone, preferredCountry, mainNeed];
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
    message.length > 5000 ||
    quizSummary.length > 2000
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
      message,
      quizSummary,
    },
  };
}
