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
import { detectBinaryMime, isAllowedStoredMime, isPathInsideRoot } from "@/lib/security/upload-validation";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { storageUploadsDir } from "@/lib/admin/paths";
import { uploadGateResponse } from "@/lib/upload-gate";

const MAX_FILES = 20;
const MAX_BYTES_PER_FILE = 15 * 1024 * 1024;

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
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES_PER_FILE) {
    return { error: `Too large: ${file.name || "file"} (max 15MB each)` };
  }

  const detected = detectBinaryMime(buf);
  if (!detected || !isAllowedStoredMime(detected)) {
    return { error: `Not allowed: ${file.name || "file"} (PDF, JPEG, PNG, or WebP only)` };
  }

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

  fs.writeFileSync(diskPath, buf);

  const doc = {
    filename: original,
    storedName,
    mime: detected,
    uploadedAt: new Date().toISOString(),
    folder,
  };
  addDocumentToCustomer(customer.id, doc);
  appendAudit("client_document_upload", `${customer.id} → ${doc.filename}`);
  await tryPassportOcrFromUpload(customer.id, buf, detected, original, storedName);
  return { document: doc };
}

async function tryPassportOcrFromUpload(customerId, buf, mime, originalName, storedName) {
  if (process.env.PASSPORT_OCR_DISABLED === "true") return;
  if (!/^image\/(jpeg|png|webp)$/i.test(String(mime || ""))) return;
  const stem = String(originalName || "").toLowerCase();
  if (!/passport|travel|identity|id.?card|licen[cs]e|photo.?id/i.test(stem)) return;
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

  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  const gated = await uploadGateResponse(token, customer);
  if (gated) return gated;

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

  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  const gated = await uploadGateResponse(token, customer);
  if (gated) return gated;

  return Response.json({
    customer: {
      id: customer.id,
      name: customer.name,
      uploadFolder: customer.uploadFolder || customer.id,
      documents: withClientUrls(token, customer),
    },
  });
}
