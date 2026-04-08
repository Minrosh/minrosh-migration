import { google } from "googleapis";
import { readGoogleServiceAccountCredentialsFromEnv } from "@/lib/google-service-account-private-key";

function getSheetsClient() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  if (!clientEmail || !privateKey) return null;

  const delegatedUser = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    subject: delegatedUser || undefined,
  });
  return google.sheets({ version: "v4", auth });
}

function norm(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toHeaderIndex(headerRow) {
  const index = new Map();
  for (let i = 0; i < headerRow.length; i += 1) {
    index.set(norm(headerRow[i]), i);
  }
  return index;
}

function pick(row, idx, key, fallback = "") {
  const i = idx.get(key);
  if (!Number.isInteger(i) || i < 0) return fallback;
  return String(row[i] || "").trim();
}

function sheetNameFromRange(range) {
  const m = /^([^!]+)!/.exec(String(range || ""));
  return (m?.[1] || "PortalStatus").replace(/^'+|'+$/g, "");
}

export async function getPortalStatusForCustomer({ customerId, email, name }) {
  const spreadsheetId = String(process.env.GOOGLE_SHEETS_STATUS_SPREADSHEET_ID || "").trim();
  if (!spreadsheetId) return { found: false, reason: "sheets_not_configured" };
  const sheets = getSheetsClient();
  if (!sheets) return { found: false, reason: "google_sheets_not_configured" };

  const range = String(process.env.GOOGLE_SHEETS_STATUS_RANGE || "PortalStatus!A:Z").trim();
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = Array.isArray(response.data.values) ? response.data.values : [];
  if (rows.length < 2) return { found: false, reason: "status_sheet_empty" };

  const idx = toHeaderIndex(rows[0]);
  const wantedId = norm(customerId);
  const wantedEmail = norm(email);
  const wantedName = norm(name);

  const bodyRows = rows.slice(1);
  const matchedIndex = bodyRows.findIndex((r) => norm(pick(r, idx, "customerId")) === wantedId);
  const matchedByEmail =
    matchedIndex === -1 ? bodyRows.findIndex((r) => wantedEmail && norm(pick(r, idx, "email")) === wantedEmail) : -1;
  const matchedByName =
    matchedIndex === -1 && matchedByEmail === -1
      ? bodyRows.findIndex((r) => wantedName && norm(pick(r, idx, "name")) === wantedName)
      : -1;
  const chosen = matchedIndex !== -1 ? matchedIndex : matchedByEmail !== -1 ? matchedByEmail : matchedByName;
  const matched = chosen !== -1 ? bodyRows[chosen] : null;

  if (!matched) return { found: false, reason: "status_not_found" };
  const sheetName = sheetNameFromRange(range);
  const rowNumber = chosen + 2;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit#range=${encodeURIComponent(`${sheetName}!A${rowNumber}:Z${rowNumber}`)}`;

  return {
    found: true,
    status: pick(matched, idx, "status", "In progress"),
    stage: pick(matched, idx, "stage", ""),
    updatedAt: pick(matched, idx, "updatedAt", ""),
    note: pick(matched, idx, "note", ""),
    source: "google_sheets",
    rowNumber,
    sheetName,
    spreadsheetUrl,
  };
}
