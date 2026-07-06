import { beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, format } from "date-fns";

vi.mock("../lib/security/rate-limit.js", () => ({
  rateLimitAllow: vi.fn(() => true),
}));

vi.mock("../lib/contact.js", () => ({
  saveEnquiry: vi.fn(),
  sendContactEmails: vi.fn(() =>
    Promise.resolve({
      internalSent: false,
      thankYouSent: false,
      brochureAttached: false,
      reason: "smtp_not_configured",
    }),
  ),
}));

const { checkConsultationAvailability, createConsultationCalendarEvent } = vi.hoisted(() => ({
  checkConsultationAvailability: vi.fn(async () => ({ available: true, checked: false })),
  createConsultationCalendarEvent: vi.fn(async () => ({ created: false })),
}));

vi.mock("../lib/google-calendar.js", () => ({
  checkConsultationAvailability,
  createConsultationCalendarEvent,
}));

vi.mock("../lib/google-drive.js", () => ({
  createLeadDriveFolder: vi.fn(async () => ({ created: false })),
}));

vi.mock("../lib/nurture-sequences.js", () => ({
  enqueueNurtureLead: vi.fn(),
}));

vi.mock("../lib/google-sheets-crm.js", () => ({
  appendLeadToSheet: vi.fn(async () => {}),
}));

vi.mock("../lib/crm/leads-service.js", () => ({
  createLead: vi.fn(() => ({ customerId: "cust-test", id: "lead-1" })),
}));

vi.mock("../lib/crm/automation-runner.js", () => ({
  runAutomationRules: vi.fn(),
}));

vi.mock("../lib/admin/customers-service.js", () => ({
  findOrCreateCustomerByIdentity: vi.fn(() => ({
    customer: { id: "cust-x" },
    created: false,
    matchedBy: "email",
  })),
}));

vi.mock("../lib/supabase/enquiries-dual-write.js", () => ({
  dualWriteEnquiryToSupabase: vi.fn(async () => ({ ok: true, skipped: true })),
}));

import { rateLimitAllow } from "../lib/security/rate-limit.js";
import { sendContactEmails } from "../lib/contact.js";
import { dualWriteEnquiryToSupabase } from "../lib/supabase/enquiries-dual-write.js";
import { POST } from "../app/api/contact/route.js";

function futureWeekendConsultationSlot() {
  for (let i = 25; i <= 45; i++) {
    const d = addDays(new Date(), i);
    if (d.getDay() === 6) {
      return { preferredDate: format(d, "yyyy-MM-dd"), preferredTime: "10:00" };
    }
  }
  throw new Error("Could not find a future Saturday for consultation slot test");
}

function consultationPayload(overrides = {}) {
  const slot = futureWeekendConsultationSlot();
  return {
    firstName: "A",
    lastName: "B",
    email: "a@example.com",
    phone: "+61000000000",
    mainNeed: "Skilled Migration",
    preferredDate: slot.preferredDate,
    preferredTime: slot.preferredTime,
    consultationDurationMins: "30",
    timeZone: "Australia/Brisbane",
    bookingType: "video",
    consultationOffer: "first_15_free",
    message: "I would like to book a consultation about skilled migration.",
    privacyPolicyAccepted: true,
    ...overrides,
  };
}

function req(json, headers = {}) {
  const body = typeof json === "string" ? json : JSON.stringify(json);
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.50",
      ...headers,
    },
    body,
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    checkConsultationAvailability.mockReset();
    checkConsultationAvailability.mockResolvedValue({ available: true, checked: false });
    createConsultationCalendarEvent.mockReset();
    createConsultationCalendarEvent.mockResolvedValue({ created: false });
  });
  it("returns 400 for invalid JSON", async () => {
    const res = await POST(req("not-json{"));
    expect(res.status).toBe(400);
    const payload = await res.json();
    expect(payload?.error?.message || payload?.error).toMatch(/invalid json/i);
  });

  it("returns 400 when validation fails", async () => {
    const res = await POST(req({ firstName: "", email: "a@b.com", message: "x" }));
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    rateLimitAllow.mockReturnValueOnce(false);
    const res = await POST(
      req({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+61000000000",
        mainNeed: "General Enquiry",
        message: "Hello",
        privacyPolicyAccepted: true,
      }),
    );
    expect(res.status).toBe(429);
  });

  it("returns 200 ok when payload is valid (side effects mocked)", async () => {
    rateLimitAllow.mockReturnValue(true);
    const res = await POST(
      req({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+61000000000",
        mainNeed: "General Enquiry",
        message: "Hello",
        privacyPolicyAccepted: true,
      }),
    );
    expect(res.status).toBe(200);
    const payload = await res.json();
    const j = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    expect(j.id).toBeTruthy();
  });

  it("returns 503 MAIL_DELIVERY_FAILED when internal SMTP send fails (configured)", async () => {
    rateLimitAllow.mockReturnValue(true);
    sendContactEmails.mockResolvedValueOnce({
      internalSent: false,
      thankYouSent: false,
      brochureAttached: false,
      reason: "smtp_timeout",
    });
    const res = await POST(
      req({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+61000000000",
        mainNeed: "General Enquiry",
        message: "Hello",
        privacyPolicyAccepted: true,
      }),
    );
    expect(res.status).toBe(503);
    const payload = await res.json();
    expect(payload?.ok).toBe(false);
    expect(payload?.error?.code).toBe("MAIL_DELIVERY_FAILED");
    expect(String(payload?.error?.message || "")).toMatch(/try again/i);
  });

  it("returns 503 and does not attempt email when Supabase dual-write fails", async () => {
    rateLimitAllow.mockReturnValue(true);
    dualWriteEnquiryToSupabase.mockResolvedValueOnce({ ok: false, error: "insert_failed" });
    sendContactEmails.mockClear();
    const res = await POST(
      req({
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        phone: "+61000000000",
        mainNeed: "General Enquiry",
        message: "Hello",
        privacyPolicyAccepted: true,
      }),
    );
    expect(res.status).toBe(503);
    const payload = await res.json();
    expect(payload?.ok).toBe(false);
    expect(payload?.error?.code).toBe("UPSTREAM_ERROR");
    expect(sendContactEmails).not.toHaveBeenCalled();
  });

  it("returns 200 for valid consultation booking without resume", async () => {
    rateLimitAllow.mockReturnValue(true);
    dualWriteEnquiryToSupabase.mockResolvedValueOnce({ ok: true, skipped: true });
    sendContactEmails.mockResolvedValueOnce({
      internalSent: true,
      thankYouSent: true,
      brochureAttached: false,
    });
    const res = await POST(req(consultationPayload()));
    expect(res.status).toBe(200);
    const payload = await res.json();
    const j = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    expect(j.id).toBeTruthy();
    expect(j.consultationBooked).toBe(false);
  });

  it("returns 400 for invalid consultation time window", async () => {
    rateLimitAllow.mockReturnValue(true);
    let weekdayDate = "";
    for (let i = 30; i <= 40; i++) {
      const d = addDays(new Date(), i);
      const day = d.getDay();
      if (day >= 1 && day <= 5) {
        weekdayDate = format(d, "yyyy-MM-dd");
        break;
      }
    }
    const res = await POST(
      req(
        consultationPayload({
          preferredDate: weekdayDate,
          preferredTime: "10:00",
        }),
      ),
    );
    expect(res.status).toBe(400);
    const payload = await res.json();
    expect(payload?.error?.code).toBe("VALIDATION_FAILED");
    expect(String(payload?.error?.message || "")).toMatch(/Monday–Friday|7:00 pm/i);
  });

  it("returns 200 with manual-confirm warning when calendar is not configured", async () => {
    rateLimitAllow.mockReturnValue(true);
    checkConsultationAvailability.mockResolvedValueOnce({
      available: true,
      checked: false,
      reason: "google_calendar_not_configured",
    });
    createConsultationCalendarEvent.mockResolvedValueOnce({
      created: false,
      reason: "google_calendar_not_configured",
    });
    dualWriteEnquiryToSupabase.mockResolvedValueOnce({ ok: true, skipped: true });
    sendContactEmails.mockResolvedValueOnce({
      internalSent: true,
      thankYouSent: true,
      brochureAttached: false,
    });
    const res = await POST(req(consultationPayload()));
    expect(res.status).toBe(200);
    const payload = await res.json();
    const j = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    expect(j.consultationBooked).toBe(false);
    expect(String(j.warning || "")).toMatch(/calendar not configured|confirm manually/i);
  });

  it("returns 200 with manual-confirm warning when calendar provider errors", async () => {
    rateLimitAllow.mockReturnValue(true);
    checkConsultationAvailability.mockResolvedValueOnce({ available: true, checked: true, reason: "ok" });
    createConsultationCalendarEvent.mockResolvedValueOnce({ created: false, reason: "calendar_error" });
    dualWriteEnquiryToSupabase.mockResolvedValueOnce({ ok: true, skipped: true });
    sendContactEmails.mockResolvedValueOnce({
      internalSent: true,
      thankYouSent: true,
      brochureAttached: false,
    });
    const res = await POST(req(consultationPayload()));
    expect(res.status).toBe(200);
    const payload = await res.json();
    const j = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    expect(j.consultationBooked).toBe(false);
    expect(String(j.warning || "")).toMatch(/calendar provider is temporarily unavailable|confirm manually/i);
  });

  it("returns 200 with SMTP warning when SMTP is not configured (consultation)", async () => {
    rateLimitAllow.mockReturnValue(true);
    checkConsultationAvailability.mockResolvedValueOnce({ available: true, checked: true, reason: "ok" });
    createConsultationCalendarEvent.mockResolvedValueOnce({ created: true, meetUrl: "https://meet.google.com/test" });
    dualWriteEnquiryToSupabase.mockResolvedValueOnce({ ok: true, skipped: true });
    sendContactEmails.mockResolvedValueOnce({
      internalSent: false,
      thankYouSent: false,
      brochureAttached: false,
      reason: "smtp_not_configured",
    });
    const res = await POST(req(consultationPayload()));
    expect(res.status).toBe(200);
    const payload = await res.json();
    const j = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    expect(String(j.warning || "")).toMatch(/SMTP is not configured|follow up manually/i);
  });

  it("continues when Supabase is not configured (skipped dual-write)", async () => {
    rateLimitAllow.mockReturnValue(true);
    dualWriteEnquiryToSupabase.mockResolvedValueOnce({
      ok: true,
      skipped: true,
      reason: "supabase_not_configured",
    });
    sendContactEmails.mockResolvedValueOnce({
      internalSent: true,
      thankYouSent: true,
      brochureAttached: false,
    });
    const res = await POST(req(consultationPayload()));
    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload?.ok).toBe(true);
    expect(sendContactEmails).toHaveBeenCalled();
  });
});
