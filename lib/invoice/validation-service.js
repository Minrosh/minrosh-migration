import { readInvoiceGrns, readInvoicePos } from "@/lib/admin/json-store";
import { getInvoice } from "@/lib/admin/invoices-service";

function sumRows(rows, getAmount) {
  return Number((rows || []).reduce((acc, row) => acc + Number(getAmount(row) || 0), 0).toFixed(2));
}

export function validateInvoiceThreeWay({ invoiceId, poId, grnId, tolerance = 0.01 }) {
  const inv = getInvoice(invoiceId);
  if (!inv) return { ok: false, error: "invoice_not_found" };
  const pos = readInvoicePos();
  const grns = readInvoiceGrns();
  const po = (pos.purchaseOrders || []).find((x) => x.id === poId) || null;
  const grn = (grns.grns || []).find((x) => x.id === grnId) || null;
  if (!po || !grn) return { ok: false, error: "po_or_grn_not_found" };

  const invLines = Array.isArray(inv.lineItems) ? inv.lineItems : [];
  const poLines = Array.isArray(po.lines) ? po.lines : [];
  const grnLines = Array.isArray(grn.lines) ? grn.lines : [];

  const invAmount = sumRows(invLines, (x) => x.amount);
  const poAmount = sumRows(poLines, (x) => x.amount);
  const grnAmount = sumRows(grnLines, (x) => x.amount);

  const amountMismatch = Math.abs(invAmount - poAmount) > tolerance || Math.abs(invAmount - grnAmount) > tolerance;
  const qtyMismatch = invLines.some((l) => {
    const ref = poLines.find((p) => String(p.sku || p.description) === String(l.sku || l.description));
    if (!ref) return false;
    return Number(l.quantity || 0) > Number(ref.quantity || 0);
  });

  return {
    ok: true,
    invoiceId,
    poId,
    grnId,
    matchStatus: amountMismatch || qtyMismatch ? "mismatch" : "matched",
    discrepancies: [
      ...(amountMismatch ? [{ type: "amount", invoice: invAmount, po: poAmount, grn: grnAmount }] : []),
      ...(qtyMismatch ? [{ type: "quantity", message: "Invoice quantity exceeds PO/GRN quantity." }] : []),
    ],
    totals: { invoice: invAmount, po: poAmount, grn: grnAmount },
  };
}
