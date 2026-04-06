import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { appendAudit } from "@/lib/admin/audit";
import {
  addDocumentToCustomer,
  findCustomerByMagicToken,
  mergePassportOcrHints,
} from "@/lib/admin/customers-service";
import { ensureUploadsDir } from "@/lib/admin/json-store";
import { getPrivateCustomerDir } from "@/lib/admin/uploads-storage";
import { isPathInsideRoot } from "@/lib/security/upload-validation";
import { streamWebFileToDisk } from "@/lib/security/stream-upload";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { storageUploadsDir } from "@/lib/admin/paths";
import { uploadGateResponse } from "@/lib/upload-gate";
import { normalizeUploadTokenParam } from "@/lib/upload-token";

const MAX_FILES = 20;
const MAX_BYTES_PER_FILE = 15 * 1024 * 1024;
/** Guard multipart body size (20 × 15MB plus overhead). */
const MAX_MULTIPART_BYTES = 320 * 1024 * 1024;

function safeFileName(name) {
  const base = path.basename(String(name || "file")).replace(/[^a-zA-Z0-9._-]/g, "_");
  return (base || "file").slice(0, 120);
}

function collectUploadFiles(formData) {
  const multi = formData.getAll("files").filter((f) => f && typeof f !== "string");
  if (multi.length) return multi;
  const single = formData.get("file");
  if (single && typeof single !== "string") return [single];
  return [];
}

async function saveOneFile({ file, customer, folder }) {
  const dir = getPrivateCustomerDir(customer);
  fs.mkdirSync(dir, { recursive: true });
  if (!isPathInsideRoot(storageUploadsDir, dir)) {
    return { error: "Invalid storage path" };
  }

  const original = safeFileName(file.name);
  const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}-${original}`;
  const diskPath = path.join(dir, storedName);
  if (!isPathInsideRoot(storageUploadsDir, diskPath)) {
    return { error: "Invalid file path" };
  }

  const streamed = await streamWebFileToDisk(file, diskPath, MAX_BYTES_PER_FILE);
  if (streamed.error) {
    return { error: streamed.error };
  }
  const detected = streamed.detected;

  const doc = {
    filename: original,
    storedName,
    mime: detected,
    uploadedAt: new Date().toISOString(),
    folder,
  };
  addDocumentToCustomer(customer.id, doc);
  appendAudit("client_document_upload", `${customer.id} → ${doc.filename}`);
  await tryPassportOcrFromUpload(customer.id, diskPath, detected, original, storedName);
  return { document: doc };
}

async function tryPassportOcrFromUpload(customerId, diskPath, mime, originalName, storedName) {
  if (process.env.PASSPORT_OCR_DISABLED === "true") return;
  if (!/^image\/(jpeg|png|webp)$/i.test(String(mime || ""))) return;
  const stem = String(originalName || "").toLowerCase();
  if (!/passport|travel|identity|id.?card|licen[cs]e|photo.?id/i.test(stem)) return;
  let buf;
  try {
    buf = fs.readFileSync(diskPath);
  } catch {
    return;
  }
  if (buf.length > MAX_BYTES_PER_FILE) return;
  try {
    const { extractPassportIdentityFromBuffer } = await import("@/lib/passport-ocr");
    const hints = await extractPassportIdentityFromBuffer(buf);
    if (hints?.fullName || hints?.dateOfBirth) {
      mergePassportOcrHints(customerId, {
        fullName: hints.fullName,
        dateOfBirth: hints.dateOfBirth,
        sourceStoredName: storedName,
      });
    }
  } catch {
    /* OCR is best-effort; uploads must always succeed */
  }
}

function withClientUrls(token, customer) {
  const docs = customer.documents || [];
  return docs.map((d) => ({
    ...d,
    url: `/api/files/client/${token}/${encodeURIComponent(d.storedName)}`,
  }));
}

export async function POST(request, { params }) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`upload-post:${ip}`, { windowMs: 15 * 60 * 1000, max: 40 })) {
    return Response.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  const { token: rawParam } = await params;
  const token = normalizeUploadTokenParam(rawParam);
  if (!token) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
  }
  if (!rateLimitAllow(`upload-post-token:${token}`, { windowMs: 15 * 60 * 1000, max: 80 })) {
    return Response.json({ error: "Too many uploads for this link. Try again later." }, { status: 429 });
  }
  const customer = findCustomerByMagicToken(token);
  const gated = await uploadGateResponse(token, customer);
  if (gated) return gated;

  const clPost = request.headers.get("content-length");
  if (clPost) {
    const n = Number(clPost);
    if (Number.isFinite(n) && n > MAX_MULTIPART_BYTES) {
      return Response.json({ error: "Upload request too large." }, { status: 413 });
    }
  }

  const formData = await request.formData();
  const files = collectUploadFiles(formData);

  if (files.length === 0) {
    return Response.json({ error: "Add at least one file" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return Response.json({ error: `Maximum ${MAX_FILES} files per upload` }, { status: 400 });
  }

  ensureUploadsDir();
  const folder = customer.uploadFolder || customer.id;

  const documents = [];
  const errors = [];

  for (const file of files) {
    const result = await saveOneFile({ file, customer, folder });
    if (result.error) {
      errors.push(result.error);
    } else {
      documents.push({
        ...result.document,
        url: `/api/files/client/${token}/${encodeURIComponent(result.document.storedName)}`,
      });
    }
  }

  if (documents.length === 0) {
    return Response.json({ error: errors[0] || "Upload failed", errors }, { status: 400 });
  }

  return Response.json({
    ok: true,
    documents,
    count: documents.length,
    errors: errors.length ? errors : undefined,
  });
}

export async function GET(request, { params }) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`upload-get:${ip}`, { windowMs: 15 * 60 * 1000, max: 120 })) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { token: rawParam } = await params;
  const token = normalizeUploadTokenParam(rawParam);
  if (!token) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
  }
  const customer = findCustomerByMagicToken(token);
  const gated = await uploadGateResponse(token, customer);
  if (gated) return gated;

  const listDocs = process.env.UPLOAD_GET_LISTS_DOCS === "true";
  return Response.json({
    customer: {
      id: customer.id,
      name: customer.name,
      documents: listDocs ? withClientUrls(token, customer) : [],
    },
  });
}
