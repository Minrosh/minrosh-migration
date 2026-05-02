/**
 * Consultation booking windows: wall clock in the client's selected IANA time zone.
 * Weekdays Mon–Fri: 19:00–22:00 (last start 21:30 for a 30-minute session).
 * Weekends Sat–Sun: 09:00–22:00 (last start 21:30).
 */
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const SLOT_MINS = 30;
const DAY_END_MINS = 22 * 60; // 22:00 exclusive end for session end
const WEEKDAY_START_MINS = 19 * 60;
const WEEKEND_START_MINS = 9 * 60;

/** @param {string} weekdayLong English full name from formatInTimeZone */
function isWeekend(weekdayLong) {
  const d = String(weekdayLong || "").toLowerCase();
  return d === "saturday" || d === "sunday";
}

/**
 * @param {{ preferredDate: string, preferredTime: string, timeZone?: string, slotDurationMins?: number }} input
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateConsultationSlot(input) {
  const preferredDate = String(input?.preferredDate || "").trim();
  const preferredTime = String(input?.preferredTime || "").trim();
  const timeZone = String(input?.timeZone || "Australia/Brisbane").trim() || "Australia/Brisbane";
  const slotDurationMins = Number(input?.slotDurationMins ?? SLOT_MINS);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return { ok: false, error: "Please select a valid consultation date." };
  }
  if (!/^\d{2}:\d{2}$/.test(preferredTime)) {
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

  let weekdayLong;
  let startTotalMins;
  try {
    weekdayLong = formatInTimeZone(instant, timeZone, "EEEE");
    const hourStr = formatInTimeZone(instant, timeZone, "H");
    const minStr = formatInTimeZone(instant, timeZone, "m");
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
          "Weekend consultations are available between 9:00 am and 10:00 pm only (in your selected time zone), in 30-minute slots.",
      };
    }
    return {
      ok: false,
      error:
        "Monday–Friday consultations are available between 7:00 pm and 10:00 pm only (in your selected time zone), in 30-minute slots.",
    };
  }

  return { ok: true };
}

export const CONSULTATION_SLOT_DURATION_MINS = SLOT_MINS;
