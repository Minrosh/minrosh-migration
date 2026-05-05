import { describe, expect, it } from "vitest";
import {
  isValidEmailLinear,
  normalizePreferredTime,
  parseContactSubmission,
} from "../lib/validation/contact-schema.js";

describe("parseContactSubmission", () => {
  it("rejects honeypot fields", () => {
    const r = parseContactSubmission({
      firstName: "A",
      lastName: "B",
      email: "a@b.co",
      phone: "1",
      message: "hi",
      company: "x",
    });
    expect(r.ok).toBe(false);
  });

  it("parses full submission and privacy flag", () => {
    const r = parseContactSubmission({
      firstName: "A",
      lastName: "B",
      email: "a@example.com",
      phone: "+61000000000",
      mainNeed: "General Enquiry",
      message: "Hello",
      privacyPolicyAccepted: true,
    });
    expect(r.ok).toBe(true);
    expect(r.value.privacyPolicyAccepted).toBe(true);
  });

  it("accepts consultation time from time input as HH:MM:SS within allowed window", () => {
    const r = parseContactSubmission({
      firstName: "A",
      lastName: "B",
      email: "a@example.com",
      phone: "+61000000000",
      mainNeed: "General Enquiry",
      message: "Book me",
      preferredDate: "2026-04-20",
      preferredTime: "19:00:00",
      timeZone: "Australia/Brisbane",
      consultationDurationMins: "30",
      privacyPolicyAccepted: true,
    });
    expect(r.ok).toBe(true);
    expect(r.value.preferredTime).toBe("19:00");
  });

  it("rejects consultation slot when duration is not 30 minutes", () => {
    const r = parseContactSubmission({
      firstName: "A",
      lastName: "B",
      email: "a@example.com",
      phone: "+61000000000",
      mainNeed: "General Enquiry",
      message: "Book me",
      preferredDate: "2026-04-20",
      preferredTime: "19:00",
      timeZone: "Australia/Brisbane",
      consultationDurationMins: "60",
      privacyPolicyAccepted: true,
    });
    expect(r.ok).toBe(false);
  });
});

describe("normalizePreferredTime", () => {
  it("normalizes HH:MM:SS to HH:MM", () => {
    expect(normalizePreferredTime("14:30:00")).toBe("14:30");
  });
  it("pads single-digit hour", () => {
    expect(normalizePreferredTime("9:05")).toBe("09:05");
  });
  it("returns empty for invalid strings", () => {
    expect(normalizePreferredTime("25:00")).toBe("");
    expect(normalizePreferredTime("not-a-time")).toBe("");
  });
});

describe("isValidEmailLinear", () => {
  it("accepts simple valid addresses", () => {
    expect(isValidEmailLinear("info@minroshmigration.com.au")).toBe(true);
  });
  it("rejects embedded newlines", () => {
    expect(isValidEmailLinear("a@\nb.com")).toBe(false);
  });
});
