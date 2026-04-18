import fs from "node:fs";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { API_ERROR_CODES, apiFail, requestContextFromRequest } from "@/lib/api/response";
import { findCustomerById } from "@/lib/admin/customers-service";
import { resolveCustomerFileAbsolute } from "@/lib/admin/uploads-storage";
import { downloadDriveFile } from "@/lib/google-drive";

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);

  const { customerId, name } = await params;
  const storedName = decodeURIComponent(String(name || ""));
  const customer = findCustomerById(customerId);
  if (!customer) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  }

  const docs = customer.documents || [];
  const meta = docs.find((d) => d.storedName === storedName);
  if (!meta) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  }

  if (meta.storage === "drive" && meta.driveFileId) {
    const file = await downloadDriveFile(meta.driveFileId);
    if (!file.ok) {
      return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    }
    return new Response(file.buffer, {
      status: 200,
      headers: {
        "Content-Type": meta.mime || file.mime || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(meta.filename || storedName)}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const abs = resolveCustomerFileAbsolute(customer, storedName);
  if (!abs) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  }

  const buf = fs.readFileSync(abs);
  const mime = meta.mime || "application/octet-stream";
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(meta.filename || storedName)}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
