import { Readable } from "node:stream";
import { google } from "googleapis";
import { readGoogleServiceAccountCredentialsFromEnv } from "@/lib/google-service-account-private-key";

function getDriveClient() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  if (!clientEmail || !privateKey) return null;

  const delegatedUser = String(process.env.GOOGLE_WORKSPACE_DELEGATED_USER || "").trim();
  const jwt = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
    subject: delegatedUser || undefined,
  });

  return google.drive({ version: "v3", auth: jwt });
}

function safeFolderName(value) {
  return String(value || "")
    .replace(/[/\\:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

async function findFolderByName({ drive, name, parentId }) {
  const escaped = String(name).replace(/'/g, "\\'");
  const parentClause = parentId ? ` and '${parentId}' in parents` : "";
  const q = `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '${escaped}'${parentClause}`;
  const res = await drive.files.list({
    q,
    fields: "files(id,webViewLink)",
    pageSize: 1,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  const f = res.data?.files?.[0];
  return f ? { id: f.id || "", url: f.webViewLink || "" } : null;
}

async function ensureFolder({ drive, name, parentId }) {
  const existing = await findFolderByName({ drive, name, parentId });
  if (existing?.id) return existing;
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });
  return { id: created.data.id || "", url: created.data.webViewLink || "" };
}

export async function createLeadDriveFolder({ leadId, name }) {
  const drive = getDriveClient();
  if (!drive) return { created: false, reason: "google_drive_not_configured" };

  const parent = String(process.env.GOOGLE_DRIVE_LEADS_PARENT_ID || "").trim();
  const year = String(new Date().getFullYear());
  const yearFolder = await ensureFolder({ drive, name: year, parentId: parent || undefined });
  const folderName = safeFolderName(`${name || "Lead"} - ${leadId || "lead"}`);
  const create = await ensureFolder({ drive, name: folderName, parentId: yearFolder.id || parent || undefined });

  return {
    created: true,
    folderId: create.id || "",
    folderUrl: create.url || "",
  };
}

export async function createCustomerDriveFolder({ customerId, customerName }) {
  const drive = getDriveClient();
  if (!drive) return { created: false, reason: "google_drive_not_configured" };

  const parent = String(process.env.GOOGLE_DRIVE_CUSTOMERS_PARENT_ID || "").trim();
  const year = String(new Date().getFullYear());
  const yearFolder = await ensureFolder({ drive, name: year, parentId: parent || undefined });
  const folderName = safeFolderName(`${customerName || "Client"} - ${customerId || "customer"}`);
  const create = await ensureFolder({ drive, name: folderName, parentId: yearFolder.id || parent || undefined });

  return {
    created: true,
    folderId: create.id || "",
    folderUrl: create.url || "",
  };
}

export async function uploadBufferToDriveFolder({ folderId, filename, mime, buffer }) {
  const drive = getDriveClient();
  if (!drive) return { uploaded: false, reason: "google_drive_not_configured" };
  if (!folderId) return { uploaded: false, reason: "missing_drive_folder" };

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: mime || "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id,webViewLink,webContentLink,mimeType,size",
  });

  return {
    uploaded: true,
    fileId: response.data.id || "",
    fileUrl: response.data.webViewLink || response.data.webContentLink || "",
  };
}

export async function downloadDriveFile(fileId) {
  const drive = getDriveClient();
  if (!drive || !fileId) return { ok: false };

  const meta = await drive.files.get({
    fileId,
    fields: "id,name,mimeType",
  });
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );

  return {
    ok: true,
    name: meta.data.name || "file",
    mime: meta.data.mimeType || "application/octet-stream",
    buffer: Buffer.from(res.data),
  };
}
