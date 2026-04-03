import fs from "node:fs";
import path from "node:path";
import { appendAudit } from "@/lib/admin/audit";
import { addDocumentToCustomer, findCustomerByMagicToken } from "@/lib/admin/customers-service";
import { ensureUploadsDir } from "@/lib/admin/json-store";

function safeFileName(name) {
  const base = path.basename(String(name || "file")).replace(/[^a-zA-Z0-9._-]/g, "_");
  return (base || "file").slice(0, 120);
}

export async function POST(request, { params }) {
  const { token } = await params;
  const customer = findCustomerByMagicToken(token);
  if (!customer) {
    return Response.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "file required" }, { status: 400 });
  }

  const mime = file.type || "";
  if (!mime.includes("pdf") && !mime.startsWith("image/")) {
    return Response.json({ error: "Only PDF or image uploads are allowed" }, { status: 400 });
  }

  ensureUploadsDir();
  const dir = path.join(process.cwd(), "public", "uploads", customer.id);
  fs.mkdirSync(dir, { recursive: true });

  const original = safeFileName(file.name);
  const stamp = Date.now();
  const storedName = `${stamp}-${original}`;
  const diskPath = path.join(dir, storedName);

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 15 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 15MB)" }, { status: 400 });
  }

  fs.writeFileSync(diskPath, buf);

  const publicUrl = `/uploads/${customer.id}/${storedName}`;
  const doc = {
    filename: original,
    storedName,
    url: publicUrl,
    mime,
    uploadedAt: new Date().toISOString(),
  };
  addDocumentToCustomer(customer.id, doc);
  appendAudit("client_document_upload", `${customer.id} → ${doc.filename}`);

  return Response.json({ ok: true, document: doc });
}
