/**
 * Consultation booking policy:
 * - **Minimum notice:** slot start must be at least {@link MIN_ADVANCE_HOURS} hours after submission time (wall-clock → UTC).
 * - **Business hours (authoritative):** evaluated in **Australia/Brisbane** (AEST/AEDT) regardless of the client's selected calendar time zone.
 *   Weekdays Mon–Fri: 19:00–22:00 Brisbane (last start 21:30 for a 30-minute session).
 *   Weekends Sat–Sun: 09:00–22:00 Brisbane (last start 21:30).
 * - Client `timeZone` is still used to interpret `preferredDate` + `preferredTime` into the correct UTC instant (so the booked moment matches what they chose locally).
 */
import { addHours } from "date-fns/addHours";
import { format, isValid, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const SLOT_MINS = 30;
const MIN_ADVANCE_HOURS = 24;
/** Authoritative zone for business-hours windows (not necessarily the client's display zone). */
export const CONSULTATION_BUSINESS_HOURS_TZ = "Australia/Brisbane";

const DAY_END_MINS = 22 * 60; // 22:00 exclusive end for session end
const WEEKDAY_START_MINS = 19 * 60;
const WEEKEND_START_MINS = 9 * 60;

/** @param {string} weekdayLong English full name from formatInTimeZone */
function isWeekend(weekdayLong) {
  const d = String(weekdayLong || "").toLowerCase();
  return d === "saturday" || d === "sunday";
}

/**
 * Mirrors {@link normalizePreferredTime} in contact-schema (no import: avoids circular dependency).
 * @param {unknown} value
 * @returns {string} `HH:MM` or ""
 */
function normalizePreferredTimeForSlot(value) {
  const raw = String(value ?? "").trim();
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(\.\d+)?$/.exec(raw);
  if (!m) return "";
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return "";
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/**
 * @param {{ preferredDate: string, preferredTime: string, timeZone?: string, slotDurationMins?: number }} input
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateConsultationSlot(input) {
  const preferredDate = String(input?.preferredDate || "").trim();
  const preferredTimeRaw = String(input?.preferredTime || "").trim();
  const preferredTime = normalizePreferredTimeForSlot(preferredTimeRaw);
  const timeZone = String(input?.timeZone || CONSULTATION_BUSINESS_HOURS_TZ).trim() || CONSULTATION_BUSINESS_HOURS_TZ;
  const slotDurationMins = Number(input?.slotDurationMins ?? SLOT_MINS);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return { ok: false, error: "Please select a valid consultation date." };
  }
  const calendarProbe = parse(preferredDate, "yyyy-MM-dd", new Date(0));
  if (!isValid(calendarProbe) || format(calendarProbe, "yyyy-MM-dd") !== preferredDate) {
    return { ok: false, error: "Please select a valid consultation date." };
  }
  if (!preferredTime) {
    return { ok: false, error: "Please select a valid consultation time." };
  }

  const [h, m] = preferredTime.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m) || m % 30 !== 0 || h < 0 || h > 23 || m < 0 || m > 59) {
    return {
      ok: false,
      error: "Please choose a time in 30-minute steps only (for example 7:00 or 7:30).",
    };
  }

  if (slotDurationMins !== SLOT_MINS) {
    return { ok: false, error: "Consultations are available for 30 minutes only." };
  }

  const wall = `${preferredDate}T${preferredTime}:00`;
  let instant;
  try {
    instant = fromZonedTime(wall, timeZone);
  } catch {
    return { ok: false, error: "Please select a valid time zone." };
  }
  if (!instant || Number.isNaN(instant.getTime())) {
    return { ok: false, error: "Could not interpret your preferred date and time." };
  }

  const minStart = addHours(new Date(), MIN_ADVANCE_HOURS);
  if (instant.getTime() < minStart.getTime()) {
    return {
      ok: false,
      error: `Please choose a date and time at least ${MIN_ADVANCE_HOURS} hours from now.`,
    };
  }

  let weekdayLong;
  let startTotalMins;
  try {
    weekdayLong = formatInTimeZone(instant, CONSULTATION_BUSINESS_HOURS_TZ, "EEEE");
    const hourStr = formatInTimeZone(instant, CONSULTATION_BUSINESS_HOURS_TZ, "H");
    const minStr = formatInTimeZone(instant, CONSULTATION_BUSINESS_HOURS_TZ, "m");
    startTotalMins = Number(hourStr) * 60 + Number(minStr);
  } catch {
    return { ok: false, error: "Could not interpret your preferred date and time." };
  }

  const windowStartMins = isWeekend(weekdayLong) ? WEEKEND_START_MINS : WEEKDAY_START_MINS;
  const sessionEndMins = startTotalMins + slotDurationMins;

  if (startTotalMins < windowStartMins || sessionEndMins > DAY_END_MINS) {
    if (isWeekend(weekdayLong)) {
      return {
        ok: false,
        error:
          "Weekend consultations are available between 9:00 am and 10:00 pm Brisbane time (AEST), in 30-minute slots.",
      };
    }
    return {
      ok: false,
      error:
        "Monday–Friday consultations are available between 7:00 pm and 10:00 pm Brisbane time (AEST), in 30-minute slots.",
    };
  }

  return { ok: true };
}

export const CONSULTATION_SLOT_DURATION_MINS = SLOT_MINS;
export const CONSULTATION_MIN_ADVANCE_HOURS = MIN_ADVANCE_HOURS;
