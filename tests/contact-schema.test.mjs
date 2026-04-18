import { describe, expect, it } from "vitest";
import { isValidEmailLinear, parseContactSubmission } from "../lib/validation/contact-schema.js";

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
});

describe("isValidEmailLinear", () => {
  it("accepts simple valid addresses", () => {
    expect(isValidEmailLinear("info@minroshmigration.com.au")).toBe(true);
  });
  it("rejects embedded newlines", () => {
    expect(isValidEmailLinear("a@\nb.com")).toBe(false);
  });
});
