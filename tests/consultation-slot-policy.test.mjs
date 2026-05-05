import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateConsultationSlot } from "../lib/consultation-slot-policy.js";

/** Fixed "now": Fri 1 May 2026, 12:00 midday Brisbane (AEST). */
function freezeConsultationPolicyClock() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-01T02:00:00.000Z"));
}

describe("validateConsultationSlot", () => {
  beforeEach(() => {
    freezeConsultationPolicyClock();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts weekday 7pm start in Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "19:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects weekday before 7pm Brisbane wall when interpreted in Brisbane TZ", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "18:30",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });

  it("rejects slots fewer than 24 hours ahead", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-01",
      preferredTime: "19:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
    expect(String(r.error || "")).toMatch(/24 hours/i);
  });

  it("evaluates business hours in Brisbane even when client TZ differs", () => {
    /** Same instant falls outside weekday evening window when read in Brisbane (afternoon), while wall clock is afternoon in Colombo. */
    const r = validateConsultationSlot({
      preferredDate: "2026-05-04",
      preferredTime: "14:00",
      timeZone: "Asia/Colombo",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
    expect(String(r.error || "")).toMatch(/Brisbane/i);
  });

  it("accepts last weekday start 9:30pm Brisbane", () => {
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

});

describe("validateConsultationSlot weekend advance", () => {
  beforeEach(() => {
    freezeConsultationPolicyClock();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts Saturday 9am Brisbane when more than 24h ahead", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-09",
      preferredTime: "09:00",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects Saturday 8:30am Brisbane", () => {
    const r = validateConsultationSlot({
      preferredDate: "2026-05-09",
      preferredTime: "08:30",
      timeZone: "Australia/Brisbane",
      slotDurationMins: 30,
    });
    expect(r.ok).toBe(false);
  });
});

describe("validateConsultationSlot format rules", () => {
  beforeEach(() => {
    freezeConsultationPolicyClock();
  });
  afterEach(() => {
    vi.useRealTimers();
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
