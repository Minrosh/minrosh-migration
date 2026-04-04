import fs from "node:fs";
import { findCustomerByMagicToken } from "@/lib/admin/customers-service";
import { resolveCustomerFileAbsolute } from "@/lib/admin/uploads-storage";

export async function GET(_request, { params }) {
  const { token, name } = await params;
  const storedName = decodeURIComponent(String(name || ""));
  const customer = findCustomerByMagicToken(token);
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
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
