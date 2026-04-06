import fs from "node:fs";
import { zipSync } from "fflate";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { findCustomerById } from "@/lib/admin/customers-service";
import { listCustomerFileNamesOnDisk, resolveCustomerFileAbsolute } from "@/lib/admin/uploads-storage";

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

export async function GET(_request, { params }) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();

  const { id } = await params;
  const customer = findCustomerById(id);
  if (!customer) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  const names = listCustomerFileNamesOnDisk(customer);
  if (names.length === 0) {
    return Response.json({ error: "No files in customer folder" }, { status: 404 });
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
      return Response.json(
        { error: "Combined files exceed the maximum size for a single ZIP download (100MB)." },
        { status: 413 }
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
    return Response.json({ error: "No files could be read" }, { status: 404 });
  }

  let zipped;
  try {
    zipped = zipSync(zipObj, { level: 6 });
  } catch {
    return Response.json({ error: "Could not build ZIP" }, { status: 500 });
  }

  const base = safeZipBase(customer.name, customer.id);
  appendAudit("customer_documents_zip", customer.id);

  return new Response(zipped, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${base}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
