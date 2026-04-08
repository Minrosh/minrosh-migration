import { google } from "googleapis";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readGoogleServiceAccountCredentialsFromEnv } from "@/lib/google-service-account-private-key";

function getAuth(scopes) {
  const { clientEmail: email, privateKey: key } = readGoogleServiceAccountCredentialsFromEnv();
  const subject = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  if (!email || !key) return null;
  return new google.auth.JWT({
    email,
    key,
    scopes,
    subject: subject || undefined,
  });
}

async function testCalendar() {
  try {
    const auth = getAuth(["https://www.googleapis.com/auth/calendar.readonly"]);
    if (!auth) return { name: "Calendar FreeBusy", ok: false, detail: "Missing service account credentials" };
    const calendar = google.calendar({ version: "v3", auth });
    const calendarId = String(process.env.GOOGLE_CALENDAR_ID || "primary").trim();
    const start = new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: calendarId }],
      },
    });
    return { name: "Calendar FreeBusy", ok: true, detail: `Access confirmed for ${calendarId}` };
  } catch (e) {
    return { name: "Calendar FreeBusy", ok: false, detail: e?.message || "FreeBusy probe failed" };
  }
}

async function testSheets() {
  try {
    const auth = getAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"]);
    const spreadsheetId = String(process.env.GOOGLE_SHEETS_STATUS_SPREADSHEET_ID || "").trim();
    const range = String(process.env.GOOGLE_SHEETS_STATUS_RANGE || "PortalStatus!A:Z").trim();
    if (!auth || !spreadsheetId) {
      return { name: "Sheets Access", ok: false, detail: "Missing auth or spreadsheet id" };
    }
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = Array.isArray(res.data.values) ? res.data.values.length : 0;
    return { name: "Sheets Access", ok: true, detail: `Read success (${rows} row set)` };
  } catch (e) {
    return { name: "Sheets Access", ok: false, detail: e?.message || "Sheets probe failed" };
  }
}

async function testDrive() {
  try {
    const auth = getAuth(["https://www.googleapis.com/auth/drive"]);
    if (!auth) return { name: "Drive Write/Delete", ok: false, detail: "Missing service account credentials" };
    const drive = google.drive({ version: "v3", auth });
    const parent = String(process.env.GOOGLE_DRIVE_CUSTOMERS_PARENT_ID || "").trim();
    const create = await drive.files.create({
      requestBody: {
        name: `minrosh-healthcheck-${Date.now()}`,
        mimeType: "application/vnd.google-apps.folder",
        ...(parent ? { parents: [parent] } : {}),
      },
      fields: "id",
    });
    const id = create.data.id;
    if (!id) return { name: "Drive Write/Delete", ok: false, detail: "Drive create returned no id" };
    await drive.files.delete({ fileId: id });
    return { name: "Drive Write/Delete", ok: true, detail: "Create/delete probe succeeded" };
  } catch (e) {
    return { name: "Drive Write/Delete", ok: false, detail: e?.message || "Drive probe failed" };
  }
}

export async function POST() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const results = await Promise.all([testCalendar(), testSheets(), testDrive()]);
  const ok = results.every((r) => r.ok);
  return Response.json({ ok, results, checkedAt: new Date().toISOString() });
}
