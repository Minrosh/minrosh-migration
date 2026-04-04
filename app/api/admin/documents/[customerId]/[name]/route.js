import fs from "node:fs";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { findCustomerById } from "@/lib/admin/customers-service";
import { resolveCustomerFileAbsolute } from "@/lib/admin/uploads-storage";

export async function GET(_request, { params }) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();

  const { customerId, name } = await params;
  const storedName = decodeURIComponent(String(name || ""));
  const customer = findCustomerById(customerId);
  if (!customer) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const docs = customer.documents || [];
  const meta = docs.find((d) => d.storedName === storedName);
  if (!meta) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const abs = resolveCustomerFileAbsolute(customer, storedName);
  if (!abs) {
    return Response.json({ error: "Not found" }, { status: 404 });
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
