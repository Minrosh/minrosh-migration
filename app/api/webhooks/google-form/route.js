import crypto from "node:crypto";
import { saveEnquiry } from "@/lib/contact";
import { enqueueNurtureLead } from "@/lib/nurture-sequences";
import { MAIN_NEEDS, isValidEmailLinear } from "@/lib/validation/contact-schema";

function validSecret(request) {
  const expected = String(process.env.GOOGLE_FORM_WEBHOOK_SECRET || "").trim();
  if (!expected) return false;
  if (process.env.NODE_ENV === "production" && expected.length < 16) {
    return false;
  }
  const got = request.headers.get("x-webhook-secret") || "";
  return got === expected;
}

function stableFormRowId(body) {
  const key = String(body.responseId || body.submissionId || body.idempotencyKey || "").trim();
  if (key) return `FORM-${key.slice(0, 200)}`;
  const basis = JSON.stringify({
    email: String(body.email || "").trim().toLowerCase(),
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    message: String(body.message || "").trim(),
    submittedAt: String(body.submittedAt || body.timestamp || "").trim(),
  });
  const digest = crypto.createHash("sha256").update(basis).digest("hex");
  return `FORM-${digest.slice(0, 32)}`;
}

function normalizeMainNeed(value) {
  const input = String(value || "").trim();
  if (!input) return "General Enquiry";
  for (const allowed of MAIN_NEEDS) {
    if (allowed.toLowerCase() === input.toLowerCase()) return allowed;
  }
  return "General Enquiry";
}

export async function POST(request) {
  if (!validSecret(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const firstName = String(body.firstName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  if (!firstName || !email) {
    return Response.json({ error: "firstName and email are required" }, { status: 400 });
  }
  if (!isValidEmailLinear(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }
  const row = {
    id: stableFormRowId(body),
    createdAt: now,
    firstName,
    lastName: String(body.lastName || "").trim(),
    email,
    phone: String(body.phone || "").trim(),
    preferredCountry: "Australia",
    mainNeed: normalizeMainNeed(body.mainNeed),
    message: String(body.message || "Lead submitted via Google Form webhook").trim(),
    quizSummary: "",
    source: "google_form_webhook",
  };
  const saveResult = saveEnquiry(row, { dedupeById: true });
  const saved = saveResult?.saved !== false;
  if (saved) {
    enqueueNurtureLead(row);
  }
  return Response.json({ ok: true, id: row.id, duplicate: !saved });
}
