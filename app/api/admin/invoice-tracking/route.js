import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import {
  createInvoiceExpense,
  createInvoiceTimeEntry,
  listInvoiceExpenses,
  listInvoiceTimeEntries,
} from "@/lib/admin/invoices-service";
import { readInvoiceGrns, readInvoicePos, writeInvoiceGrns, writeInvoicePos } from "@/lib/admin/json-store";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({
    timeEntries: listInvoiceTimeEntries(),
    expenses: listInvoiceExpenses(),
    purchaseOrders: readInvoicePos().purchaseOrders || [],
    grns: readInvoiceGrns().grns || [],
  });
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
  if (body?.type === "time") return Response.json({ entry: createInvoiceTimeEntry(body) });
  if (body?.type === "expense") return Response.json({ expense: createInvoiceExpense(body) });
  if (body?.type === "po") {
    const data = readInvoicePos();
    const rows = Array.isArray(data.purchaseOrders) ? data.purchaseOrders : [];
    const row = { id: String(body.id || `po-${Date.now()}`), lines: Array.isArray(body.lines) ? body.lines : [] };
    rows.unshift(row);
    writeInvoicePos({ purchaseOrders: rows.slice(0, 10000) });
    return Response.json({ purchaseOrder: row });
  }
  if (body?.type === "grn") {
    const data = readInvoiceGrns();
    const rows = Array.isArray(data.grns) ? data.grns : [];
    const row = { id: String(body.id || `grn-${Date.now()}`), lines: Array.isArray(body.lines) ? body.lines : [] };
    rows.unshift(row);
    writeInvoiceGrns({ grns: rows.slice(0, 10000) });
    return Response.json({ grn: row });
  }
  return Response.json({ error: "Unknown type" }, { status: 400 });
}
