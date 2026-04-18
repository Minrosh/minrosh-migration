import fs from "node:fs";
import { zipSync } from "fflate";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, requestContextFromRequest } from "@/lib/api/response";
import { findCustomerById } from "@/lib/admin/customers-service";
import { listCustomerFileNamesOnDisk, resolveCustomerFileAbsolute } from "@/lib/admin/uploads-storage";
import { getClientIp } from "@/lib/security/request-ip";

function safeZipBase(name, id) {
  const slug =
    String(name || "customer")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "customer";
  const short = String(id || "").replace(/^cust-/, "").slice(0, 8);
  return `${slug}-${short}-documents`;
}

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);

  const { id } = await params;
  const customer = findCustomerById(id);
  if (!customer) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Customer not found", status: 404 }, context);
  }

  const names = listCustomerFileNamesOnDisk(customer);
  if (names.length === 0) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "No files in customer folder", status: 404 }, context);
  }

  const MAX_ZIP_INPUT_BYTES = 100 * 1024 * 1024;
  let totalBytes = 0;
  for (const name of names) {
    const abs = resolveCustomerFileAbsolute(customer, name);
    if (!abs) continue;
    try {
      totalBytes += fs.statSync(abs).size;
    } catch {
      continue;
    }
    if (totalBytes > MAX_ZIP_INPUT_BYTES) {
      return apiFail(
        {
          code: API_ERROR_CODES.VALIDATION_FAILED,
          message: "Combined files exceed the maximum size for a single ZIP download (100MB).",
          status: 413,
        },
        context
      );
    }
  }

  /** @type {Record<string, Uint8Array>} */
  const zipObj = {};
  for (const name of names) {
    const abs = resolveCustomerFileAbsolute(customer, name);
    if (!abs) continue;
    zipObj[name] = new Uint8Array(fs.readFileSync(abs));
  }

  if (Object.keys(zipObj).length === 0) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "No files could be read", status: 404 }, context);
  }

  let zipped;
  try {
    zipped = zipSync(zipObj, { level: 6 });
  } catch {
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: "Could not build ZIP", status: 500 }, context);
  }

  const base = safeZipBase(customer.name, customer.id);
  appendAudit(AUDIT_ACTIONS.CUSTOMER_DOCUMENTS_ZIP, customer.id, {
    ip: getClientIp(request),
    route: "GET /api/admin/customers/[id]/documents-zip",
    requestId: context.requestId,
  });

  return new Response(zipped, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${base}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
