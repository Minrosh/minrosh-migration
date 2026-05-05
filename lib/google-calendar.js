import { randomUUID } from "node:crypto";
import { addMinutes } from "date-fns/addMinutes";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { google } from "googleapis";
import { readGoogleServiceAccountCredentialsFromEnv } from "@/lib/google-service-account-private-key";
import { CONSULTATION_SLOT_DURATION_MINS } from "@/lib/consultation-slot-policy";

function getCalendarClient() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  if (!clientEmail || !privateKey) return null;

  const delegatedUser = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  const jwt = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    subject: delegatedUser || undefined,
  });

  return google.calendar({ version: "v3", auth: jwt });
}

/** @param {Record<string, unknown>} contact */
function buildSlot(contact) {
  const date = String(contact.preferredDate || "").trim();
  const time = String(contact.preferredTime || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const timeZone = String(contact.timeZone || "Australia/Brisbane").trim() || "Australia/Brisbane";
  const wallStart = `${date}T${time}:00`;
  let startUtc;
  try {
    startUtc = fromZonedTime(wallStart, timeZone);
  } catch {
    return null;
  }
  if (!startUtc || Number.isNaN(startUtc.getTime())) return null;
  const durationMins = CONSULTATION_SLOT_DURATION_MINS;
  const endUtc = addMinutes(startUtc, durationMins);
  let endLocalStr;
  try {
    endLocalStr = formatInTimeZone(endUtc, timeZone, "yyyy-MM-dd'T'HH:mm:ss");
  } catch {
    return null;
  }
  return {
    startUtc,
    endUtc,
    startLocalStr: wallStart,
    endLocalStr,
    durationMins,
    timeZone,
  };
}

export async function checkConsultationAvailability(contact) {
  const calendar = getCalendarClient();
  if (!calendar) return { available: true, checked: false, reason: "google_calendar_not_configured" };
  const slot = buildSlot(contact);
  if (!slot) return { available: false, checked: true, reason: "missing_slot" };
  const calendarId = String(process.env.GOOGLE_CALENDAR_ID || "primary").trim();
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: slot.startUtc.toISOString(),
      timeMax: slot.endUtc.toISOString(),
      timeZone: slot.timeZone,
      items: [{ id: calendarId }],
    },
  });
  const busy = fb.data?.calendars?.[calendarId]?.busy || [];
  return {
    available: !Array.isArray(busy) || busy.length === 0,
    checked: true,
    reason: Array.isArray(busy) && busy.length > 0 ? "slot_unavailable" : "ok",
  };
}

export async function createConsultationCalendarEvent(contact) {
  const calendar = getCalendarClient();
  if (!calendar) return { created: false, reason: "google_calendar_not_configured" };
  const slot = buildSlot(contact);
  if (!slot) return { created: false, reason: "missing_slot" };
  const { startLocalStr, endLocalStr, timeZone } = slot;
  const calendarId = String(process.env.GOOGLE_CALENDAR_ID || "primary").trim();
  const meetRequestId = `minrosh-${randomUUID()}`;

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim() || "Client";
  const bookingType = String(contact.bookingType || "video").trim() || "video";
  const isVideo = bookingType === "video";
  const isPhone = bookingType === "phone";
  const isInPerson = bookingType === "in_person";
  const inPersonLocation = String(process.env.CONSULTATION_OFFICE_ADDRESS || "Brisbane office (address confirmed by email)").trim();
  const quizLine = String(contact.quizSummary || "").trim();
  const resumeUploaded =
    String(contact.resumeUploadStatus || "").trim() === "uploaded" && String(contact.resumeFileName || "").trim();
  const resumeLine = resumeUploaded
    ? `Resume uploaded: ${String(contact.resumeFileName).trim()} (see lead Drive folder).`
    : "";
  const description = [
    "Consultation booked from MinRosh website.",
    "",
    `Preferred slot (wall clock in ${timeZone}): ${String(contact.preferredDate || "").trim()} ${String(contact.preferredTime || "").trim()} · ${slot.durationMins} min`,
    "",
    `Enquiry ID: ${contact.id}`,
    `Client: ${fullName}`,
    `Email: ${contact.email || "Not provided"}`,
    `Phone: ${contact.phone || "Not provided"}`,
    `Preferred country: ${contact.preferredCountry || "Australia"}`,
    `Main need: ${contact.mainNeed || "General Enquiry"}`,
    `Consultation type: ${bookingType}`,
    quizLine ? `Quiz summary: ${quizLine}` : "",
    resumeLine,
    "",
    "Client message:",
    String(contact.message || "").trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const response = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: `MinRosh Consultation — ${fullName}`,
      description,
      start: {
        dateTime: startLocalStr,
        timeZone,
      },
      end: {
        dateTime: endLocalStr,
        timeZone,
      },
      attendees: contact.email ? [{ email: contact.email }] : [],
      ...(isInPerson ? { location: inPersonLocation } : {}),
      ...(isPhone ? { location: `Phone call: ${contact.phone || "Phone to be confirmed"}` } : {}),
      ...(isVideo
        ? {
            conferenceData: {
              createRequest: {
                requestId: meetRequestId,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          }
        : {}),
    },
  });

  const event = response.data || {};
  const meetUrl = isVideo
    ? event.hangoutLink ||
      event.conferenceData?.entryPoints?.find((p) => p.entryPointType === "video")?.uri ||
      ""
    : "";

  return {
    created: true,
    eventId: event.id || "",
    eventHtmlLink: event.htmlLink || "",
    meetUrl,
  };
}

export async function createVisaExpiryReminder({ customerId, customerName, visaExpiryDate }) {
  const calendar = getCalendarClient();
  if (!calendar) return { created: false, reason: "google_calendar_not_configured" };
  const date = String(visaExpiryDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { created: false, reason: "invalid_visa_expiry_date" };
  const calendarId = String(process.env.GOOGLE_CALENDAR_ID || "primary").trim();
  const title = `Visa expiry reminder — ${customerName || customerId || "Client"}`;
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: title,
      description: `Auto-created by MinRosh CRM for customer ${customerId || ""}.`,
      start: { date },
      end: { date },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 14 * 24 * 60 },
          { method: "popup", minutes: 7 * 24 * 60 },
          { method: "popup", minutes: 24 * 60 },
        ],
      },
    },
  });
  return { created: true, eventId: response.data.id || "" };
}
