import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { createInvoice, listInvoices, updateInvoiceStatus } from "@/lib/admin/invoices-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ invoices: listInvoices() });
}

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body?.action === "setStatus") {
    const row = updateInvoiceStatus(body.id, body.status);
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("invoice_status", `${row.id} → ${row.status}`);
    return Response.json({ invoice: row });
  }

  const row = createInvoice({
    customerName: body.customerName,
    date: body.date,
    amount: body.amount,
    service: body.service,
    status: body.status,
  });
  appendAudit("invoice_create", row.invoiceNumber);
  return Response.json({ invoice: row });
}
