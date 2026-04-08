import { listInvoices, listPayments } from "@/lib/admin/invoices-service";

function toDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function invoiceSummaryReport(now = new Date()) {
  const invoices = listInvoices();
  const payments = listPayments();
  let outstanding = 0;
  let paid = 0;
  const aging = { current: 0, "1_30": 0, "31_60": 0, "61_plus": 0 };
  for (const inv of invoices) {
    const total = Number(inv.total || inv.amount || 0);
    const paidAmount = Number(inv.paidAmount || 0);
    const due = Math.max(0, total - paidAmount);
    outstanding += due;
    paid += paidAmount;
    if (due <= 0 || !inv.dueDate) continue;
    const dd = toDate(inv.dueDate);
    if (!dd) continue;
    const days = Math.floor((now - dd) / 86400000);
    if (days <= 0) aging.current += due;
    else if (days <= 30) aging["1_30"] += due;
    else if (days <= 60) aging["31_60"] += due;
    else aging["61_plus"] += due;
  }
  const lateByCustomer = {};
  for (const inv of invoices) {
    const dueDate = toDate(inv.dueDate);
    if (!dueDate) continue;
    if (now <= dueDate) continue;
    const key = inv.customerName || inv.customerEmail || "Unknown";
    lateByCustomer[key] = (lateByCustomer[key] || 0) + 1;
  }
  const latePayers = Object.entries(lateByCustomer)
    .map(([customer, lateCount]) => ({ customer, lateCount }))
    .sort((a, b) => b.lateCount - a.lateCount)
    .slice(0, 20);
  return {
    generatedAt: now.toISOString(),
    totals: {
      invoices: invoices.length,
      payments: payments.length,
      outstanding: Number(outstanding.toFixed(2)),
      paid: Number(paid.toFixed(2)),
    },
    aging: Object.fromEntries(Object.entries(aging).map(([k, v]) => [k, Number(v.toFixed(2))])),
    latePayers,
  };
}
