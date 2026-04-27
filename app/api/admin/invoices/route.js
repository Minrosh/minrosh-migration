import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getMailTransport, contactInbox } from "@/lib/contact";
import { buildInvoicePdfBuffer } from "@/lib/admin/invoice-pdf";
import { resolveInvoicePayId, resolveInvoiceQrMode } from "@/lib/admin/invoice-payment-qr";
import { getClientIp } from "@/lib/security/request-ip";
import {
  attachTimeAndExpenses,
  createInvoice,
  getBankDetails,
  listInvoices,
  listPayments,
  listTemplates,
  deleteTemplate,
  duplicateTemplate,
  recordPayment,
  setBankDetails,
  upsertTemplate,
  updateInvoice,
  updateInvoiceStatus,
} from "@/lib/admin/invoices-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({
    invoices: listInvoices(),
    templates: listTemplates(),
    payments: listPayments(),
    bankDetails: getBankDetails(),
    invoicePayId: resolveInvoicePayId(),
    invoiceQrMode: resolveInvoiceQrMode(),
  }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  const auditContext = { ip, route: "POST /api/admin/invoices", requestId: context.requestId };
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  if (body?.action === "setStatus") {
    const row = updateInvoiceStatus(body.id, body.status);
    if (!row) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.INVOICE_STATUS, `${row.id} → ${row.status}`, auditContext);
    return apiOk({ invoice: row }, context);
  }
  if (body?.action === "recordPayment") {
    const out = recordPayment({
      invoiceId: body.id,
      amount: body.amount,
      method: body.method,
      reference: body.reference,
      paidAt: body.paidAt,
    });
    if (!out) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.INVOICE_PAYMENT, `${out.invoice.id} +${out.payment.amount}`, auditContext);
    return apiOk(out, context);
  }
  if (body?.action === "update") {
    const row = updateInvoice(body.id, body.patch || {});
    if (!row) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.INVOICE_UPDATE, row.invoiceNumber, auditContext);
    return apiOk({ invoice: row }, context);
  }
  if (body?.action === "attachTimeExpenses") {
    const row = attachTimeAndExpenses({
      invoiceId: body.id,
      timeEntryIds: body.timeEntryIds,
      expenseIds: body.expenseIds,
    });
    if (!row) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.INVOICE_ATTACH_TIME_EXPENSES, row.invoiceNumber, auditContext);
    return apiOk({ invoice: row }, context);
  }
  if (body?.action === "setBankDetails") {
    const row = setBankDetails(body.bankDetails || {});
    appendAudit(AUDIT_ACTIONS.INVOICE_BANK_DETAILS, "Updated", auditContext);
    return apiOk({ bankDetails: row }, context);
  }
  if (body?.action === "upsertTemplate") {
    const row = upsertTemplate(body.template || {});
    appendAudit(AUDIT_ACTIONS.INVOICE_TEMPLATE_UPSERT, row.name, auditContext);
    return apiOk({ template: row, templates: listTemplates() }, context);
  }
  if (body?.action === "deleteTemplate") {
    const out = deleteTemplate(body.id);
    if (!out?.removed) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Template not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.INVOICE_TEMPLATE_DELETE, out.template?.name || body.id, auditContext);
    return apiOk({ deleted: true, templates: out.templates || listTemplates() }, context);
  }
  if (body?.action === "duplicateTemplate") {
    const out = duplicateTemplate(body.id);
    if (!out?.template) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Template not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.INVOICE_TEMPLATE_DUPLICATE, out.template.name, auditContext);
    return apiOk({ template: out.template, templates: out.templates || listTemplates() }, context);
  }
  if (body?.action === "emailInvoice") {
    const id = String(body.id || "").trim();
    if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);
    const invoice = listInvoices().find((x) => x.id === id) || null;
    if (!invoice) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Invoice not found", status: 404 }, context);
    const to = String(body.to || invoice.customerEmail || "").trim().toLowerCase();
    if (!to) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Recipient email required", status: 400 }, context);
    const transporter = getMailTransport();
    if (!transporter) return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "SMTP not configured", status: 400 }, context);
    const pdfBuffer = await buildInvoicePdfBuffer(invoice, getBankDetails());
    const smtpFrom = process.env.SMTP_FROM || contactInbox;
    const due = invoice.dueDate || invoice.date;
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `Tax Invoice INV-${invoice.invoiceNumber}`,
      text: [
        `Dear ${invoice.customerName || "Customer"},`,
        "",
        `Please find attached your tax invoice INV-${invoice.invoiceNumber}.`,
        `Due date: ${due}`,
        `Total payable: ${(invoice.currency || "AUD")} ${Number(invoice.total || invoice.amount || 0).toFixed(2)}`,
        "",
        "Please contact us if you need any amendments.",
      ].join("\n"),
      attachments: [
        {
          filename: `INV-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    appendAudit(AUDIT_ACTIONS.INVOICE_EMAIL_SENT, invoice.invoiceNumber, auditContext);
    return apiOk({ sent: true }, context);
  }

  const row = createInvoice({
    customerId: body.customerId,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerContact: body.customerContact,
    customerAddress: body.customerAddress,
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
    discount: body.discount,
    discountDescription: body.discountDescription,
  });
  appendAudit(AUDIT_ACTIONS.INVOICE_CREATE, row.invoiceNumber, auditContext);
  return apiOk({ invoice: row }, context);
}
