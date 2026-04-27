import { google } from "googleapis";
import { readGoogleServiceAccountCredentialsFromEnv } from "@/lib/google-service-account-private-key";
import { deriveLeadSegmentation } from "@/lib/crm/lead-segmentation";

function getSheetsClient() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  if (!clientEmail || !privateKey) return null;
  const delegatedUser = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    subject: delegatedUser || undefined,
  });
  return google.sheets({ version: "v4", auth });
}

export async function appendLeadToSheet(contact) {
  const sheets = getSheetsClient();
  const spreadsheetId = String(process.env.GOOGLE_SHEETS_CRM_SPREADSHEET_ID || "").trim();
  const range = String(process.env.GOOGLE_SHEETS_CRM_APPEND_RANGE || "Leads!A:Z").trim();
  if (!sheets || !spreadsheetId) return { appended: false, reason: "sheets_crm_not_configured" };
  const segmentation = deriveLeadSegmentation({
    mainNeed: contact.mainNeed,
    goal: contact.goal,
    preferredCountry: contact.preferredCountry,
    source: contact.source,
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toISOString(),
        String(contact.id || ""),
        String(contact.firstName || ""),
        String(contact.lastName || ""),
        String(contact.email || ""),
        String(contact.phone || ""),
        String(contact.preferredCountry || ""),
        String(contact.mainNeed || ""),
        String(segmentation.pathwaySegment || ""),
        String(contact.source || ""),
        "New",
      ]],
    },
  });
  return { appended: true };
}

export async function getLeadSheetSummary() {
  const sheets = getSheetsClient();
  const spreadsheetId = String(process.env.GOOGLE_SHEETS_CRM_SPREADSHEET_ID || "").trim();
  const range = String(process.env.GOOGLE_SHEETS_CRM_SUMMARY_RANGE || "Leads!A:Z").trim();
  if (!sheets || !spreadsheetId) return { ok: false, reason: "sheets_crm_not_configured" };
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = Array.isArray(res.data.values) ? res.data.values : [];
  const body = rows.slice(1);
  const idxStatus = (rows[0] || []).findIndex((h) => String(h).trim().toLowerCase() === "lead status");
  const counts = { New: 0, Contacted: 0, Paid: 0, Lodged: 0 };
  for (const r of body) {
    const s = String(r[idxStatus] || "").trim();
    if (counts[s] !== undefined) counts[s] += 1;
  }
  return { ok: true, totalRows: body.length, counts };
}
