import { randomUUID } from "node:crypto";
import { readInvoices, writeInvoices } from "./json-store";

function nextInvoiceNumber(invoices) {
  const year = new Date().getFullYear();
  const nums = invoices
    .map((inv) => inv.invoiceNumber)
    .filter(Boolean)
    .map((n) => {
      const m = String(n).match(/(\d{4})-(\d+)/);
      return m && m[1] === String(year) ? parseInt(m[2], 10) : 0;
    });
  const max = nums.length ? Math.max(...nums) : 0;
  return `${year}-${String(max + 1).padStart(4, "0")}`;
}

export function listInvoices() {
  const { invoices } = readInvoices();
  return invoices || [];
}

export function createInvoice({ customerName, date, amount, service, status = "pending" }) {
  const data = readInvoices();
  const invoices = data.invoices || [];
  const row = {
    id: `inv-${randomUUID()}`,
    invoiceNumber: nextInvoiceNumber(invoices),
    customerName: String(customerName || "").trim(),
    date: String(date || new Date().toISOString().slice(0, 10)),
    amount: Number(amount) || 0,
    service: String(service || "").trim(),
    status: status === "paid" ? "paid" : "pending",
    createdAt: new Date().toISOString(),
  };
  invoices.unshift(row);
  writeInvoices({ invoices });
  return row;
}

export function updateInvoiceStatus(id, status) {
  const data = readInvoices();
  const invoices = data.invoices || [];
  const i = invoices.findIndex((x) => x.id === id);
  if (i === -1) return null;
  invoices[i] = {
    ...invoices[i],
    status: status === "paid" ? "paid" : "pending",
  };
  writeInvoices({ invoices });
  return invoices[i];
}

export function getInvoice(id) {
  return listInvoices().find((x) => x.id === id) || null;
}
