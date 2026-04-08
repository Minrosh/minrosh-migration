import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import {
  attachTimeAndExpenses,
  createInvoice,
  getBankDetails,
  listInvoices,
  listPayments,
  listTemplates,
  recordPayment,
  setBankDetails,
  updateInvoice,
  updateInvoiceStatus,
} from "@/lib/admin/invoices-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ invoices: listInvoices(), templates: listTemplates(), payments: listPayments(), bankDetails: getBankDetails() });
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
  if (body?.action === "recordPayment") {
    const out = recordPayment({
      invoiceId: body.id,
      amount: body.amount,
      method: body.method,
      reference: body.reference,
      paidAt: body.paidAt,
    });
    if (!out) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("invoice_payment", `${out.invoice.id} +${out.payment.amount}`);
    return Response.json(out);
  }
  if (body?.action === "update") {
    const row = updateInvoice(body.id, body.patch || {});
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("invoice_update", row.invoiceNumber);
    return Response.json({ invoice: row });
  }
  if (body?.action === "attachTimeExpenses") {
    const row = attachTimeAndExpenses({
      invoiceId: body.id,
      timeEntryIds: body.timeEntryIds,
      expenseIds: body.expenseIds,
    });
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("invoice_attach_time_expenses", row.invoiceNumber);
    return Response.json({ invoice: row });
  }
  if (body?.action === "setBankDetails") {
    const row = setBankDetails(body.bankDetails || {});
    appendAudit("invoice_bank_details", "Updated");
    return Response.json({ bankDetails: row });
  }

  const row = createInvoice({
    customerId: body.customerId,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerCountry: body.customerCountry,
    date: body.date,
    dueDate: body.dueDate,
    amount: body.amount,
    service: body.service,
    status: body.status,
    lineItems: body.lineItems,
    currency: body.currency,
    templateId: body.templateId,
    terms: body.terms,
    notes: body.notes,
    recurringRuleId: body.recurringRuleId,
  });
  appendAudit("invoice_create", row.invoiceNumber);
  return Response.json({ invoice: row });
}
