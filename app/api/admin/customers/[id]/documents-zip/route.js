import fs from "node:fs";
import path from "node:path";
import { zipSync } from "fflate";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { findCustomerById } from "@/lib/admin/customers-service";

function safeZipBase(name, id) {
  const slug = String(name || "customer")
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

  const folder = customer.uploadFolder || customer.id;
  const dir = path.join(process.cwd(), "public", "uploads", folder);

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return Response.json({ error: "No upload folder on disk" }, { status: 404 });
  }

  const names = fs.readdirSync(dir).filter((n) => {
    if (n.startsWith(".")) return false;
    const p = path.join(dir, n);
    return fs.statSync(p).isFile();
  });

  if (names.length === 0) {
    return Response.json({ error: "No files in customer folder" }, { status: 404 });
  }

  /** @type {Record<string, Uint8Array>} */
  const zipObj = {};
  for (const name of names) {
    const full = path.join(dir, name);
    zipObj[name] = new Uint8Array(fs.readFileSync(full));
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
