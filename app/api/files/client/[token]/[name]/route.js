import fs from "node:fs";
import { Readable } from "node:stream";
import { findCustomerByMagicToken } from "@/lib/admin/customers-service";
import { resolveCustomerFileAbsolute } from "@/lib/admin/uploads-storage";
import { uploadGateResponse } from "@/lib/upload-gate";
import { normalizeUploadTokenParam } from "@/lib/upload-token";
import { downloadDriveFile } from "@/lib/google-drive";

export async function GET(request, { params }) {
  const { token: rawParam, name } = await params;
  const token = normalizeUploadTokenParam(rawParam);
  if (!token) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const storedName = decodeURIComponent(String(name || ""));
  const customer = findCustomerByMagicToken(token);
  if (!customer) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const gated = await uploadGateResponse(token, customer);
  if (gated) return gated;

  const docs = customer.documents || [];
  const meta = docs.find((d) => d.storedName === storedName);
  if (!meta) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (meta.storage === "drive" && meta.driveFileId) {
    const file = await downloadDriveFile(meta.driveFileId);
    if (!file.ok) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return new Response(file.buffer, {
      status: 200,
      headers: {
        "Content-Type": meta.mime || file.mime || "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const abs = resolveCustomerFileAbsolute(customer, storedName);
  if (!abs) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const mime = meta.mime || "application/octet-stream";
  const stream = fs.createReadStream(abs);
  const web = Readable.toWeb(stream);
  return new Response(web, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
