import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { appendAudit } from "@/lib/admin/audit";
import { addDocumentToCustomer, findCustomerByMagicToken } from "@/lib/admin/customers-service";
import { ensureUploadsDir } from "@/lib/admin/json-store";

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

function isAllowedMime(mime) {
  return Boolean(mime && (mime.includes("pdf") || mime.startsWith("image/")));
}

async function saveOneFile({ file, customer, folder, dir }) {
  const mime = file.type || "";
  if (!isAllowedMime(mime)) {
    return { error: `Not allowed: ${file.name || "file"} (only PDF or images)` };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES_PER_FILE) {
    return { error: `Too large: ${file.name || "file"} (max 15MB each)` };
  }

  const original = safeFileName(file.name);
  const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}-${original}`;
  const diskPath = path.join(dir, storedName);
  fs.writeFileSync(diskPath, buf);

  const publicUrl = `/uploads/${folder}/${storedName}`;
  const doc = {
    filename: original,
    storedName,
    url: publicUrl,
    folder,
    mime,
    uploadedAt: new Date().toISOString(),
  };
  addDocumentToCustomer(customer.id, doc);
  appendAudit("client_document_upload", `${customer.id} → ${doc.filename}`);
  return { document: doc };
}

export async function POST(request, { params }) {
  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  if (!customer) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
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
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  fs.mkdirSync(dir, { recursive: true });

  const documents = [];
  const errors = [];

  for (const file of files) {
    const result = await saveOneFile({ file, customer, folder, dir });
    if (result.error) {
      errors.push(result.error);
    } else {
      documents.push(result.document);
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

export async function GET(_request, { params }) {
  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  if (!customer) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
  }
  return Response.json({
    customer: {
      id: customer.id,
      name: customer.name,
      uploadFolder: customer.uploadFolder || customer.id,
      documents: customer.documents || [],
    },
  });
}
