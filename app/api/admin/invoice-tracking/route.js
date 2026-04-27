import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import {
  createInvoiceExpense,
  createInvoiceTimeEntry,
  listInvoiceExpenses,
  listInvoiceTimeEntries,
} from "@/lib/admin/invoices-service";
import { readInvoiceGrns, readInvoicePos, writeInvoiceGrns, writeInvoicePos } from "@/lib/admin/json-store";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({
    timeEntries: listInvoiceTimeEntries(),
    expenses: listInvoiceExpenses(),
    purchaseOrders: readInvoicePos().purchaseOrders || [],
    grns: readInvoiceGrns().grns || [],
  }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  if (body?.type === "time") {
    const entry = createInvoiceTimeEntry(body);
    appendAudit(AUDIT_ACTIONS.INVOICE_TIME_ENTRY_CREATE, entry.id, {
      ip: getClientIp(request),
      route: "POST /api/admin/invoice-tracking",
      requestId: context.requestId,
    });
    return apiOk({ entry }, context);
  }
  if (body?.type === "expense") {
    const expense = createInvoiceExpense(body);
    appendAudit(AUDIT_ACTIONS.INVOICE_EXPENSE_CREATE, expense.id, {
      ip: getClientIp(request),
      route: "POST /api/admin/invoice-tracking",
      requestId: context.requestId,
    });
    return apiOk({ expense }, context);
  }
  if (body?.type === "po") {
    const data = readInvoicePos();
    const rows = Array.isArray(data.purchaseOrders) ? data.purchaseOrders : [];
    const row = { id: String(body.id || `po-${Date.now()}`), lines: Array.isArray(body.lines) ? body.lines : [] };
    rows.unshift(row);
    writeInvoicePos({ purchaseOrders: rows.slice(0, 10000) });
    appendAudit(AUDIT_ACTIONS.INVOICE_PO_CREATE, row.id, {
      ip: getClientIp(request),
      route: "POST /api/admin/invoice-tracking",
      requestId: context.requestId,
    });
    return apiOk({ purchaseOrder: row }, context);
  }
  if (body?.type === "grn") {
    const data = readInvoiceGrns();
    const rows = Array.isArray(data.grns) ? data.grns : [];
    const row = { id: String(body.id || `grn-${Date.now()}`), lines: Array.isArray(body.lines) ? body.lines : [] };
    rows.unshift(row);
    writeInvoiceGrns({ grns: rows.slice(0, 10000) });
    appendAudit(AUDIT_ACTIONS.INVOICE_GRN_CREATE, row.id, {
      ip: getClientIp(request),
      route: "POST /api/admin/invoice-tracking",
      requestId: context.requestId,
    });
    return apiOk({ grn: row }, context);
  }
  return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Unknown type", status: 400 }, context);
}
