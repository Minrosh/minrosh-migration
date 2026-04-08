import { getInvoiceByPortalToken, updateInvoice } from "@/lib/admin/invoices-service";

function tokenFromRequest(request) {
  const auth = String(request.headers.get("authorization") || "");
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  return m ? m[1].trim() : "";
}

export async function GET(request) {
  const token = tokenFromRequest(request);
  const invoice = token ? getInvoiceByPortalToken(token) : null;
  if (!invoice) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({
    customerName: invoice.customerName || "",
    customerEmail: invoice.customerEmail || "",
  });
}

export async function POST(request) {
  const token = tokenFromRequest(request);
  const invoice = token ? getInvoiceByPortalToken(token) : null;
  if (!invoice) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const next = updateInvoice(invoice.id, {
    customerName: body?.customerName,
    customerEmail: body?.customerEmail,
  });
  return Response.json({ ok: true, customerName: next?.customerName || "", customerEmail: next?.customerEmail || "" });
}
