import { describe, expect, it, vi } from "vitest";

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

vi.mock("../lib/google-calendar.js", () => ({
  checkConsultationAvailability: vi.fn(async () => ({ available: true, checked: false })),
  createConsultationCalendarEvent: vi.fn(async () => ({ created: false })),
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
import { POST } from "../app/api/contact/route.js";

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
});
