import { describe, expect, it } from "vitest";
import { validateConsultationSlot } from "../lib/consultation-slot-policy.js";

describe("validateConsultationSlot", () => {
  it("accepts weekday 7pm start in Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "19:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects weekday before 7pm in Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "18:30",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });

  it("accepts last weekday start 9:30pm in Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "21:30",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects 10pm start on weekday (session would end after window)", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "22:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });

  it("accepts Saturday 9am in Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-02",
      preferredTime: "09:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects Saturday 8:30am in Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-02",
      preferredTime: "08:30",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });

  it("rejects non-30-minute steps", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "19:15",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });

  it("rejects wrong slot duration", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "19:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 45,
    });
    expect(r.ok).toBe(false);
  });

  it("rejects non-calendar dates (rollover)", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-02-31",
      preferredTime: "19:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });

  it("accepts HH:MM:SS wall time from browsers", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "19:00:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(true);
  });
});
