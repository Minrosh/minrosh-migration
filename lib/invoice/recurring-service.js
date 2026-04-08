import { createInvoice, listInvoices } from "@/lib/admin/invoices-service";
import { readInvoiceRecurringRules, writeInvoiceRecurringRules } from "@/lib/admin/json-store";

function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function listRecurringRules() {
  const data = readInvoiceRecurringRules();
  return Array.isArray(data.rules) ? data.rules : [];
}

export function upsertRecurringRule(input) {
  const data = readInvoiceRecurringRules();
  const rules = Array.isArray(data.rules) ? data.rules : [];
  const id = String(input.id || `recur-${Date.now()}`);
  const row = {
    id,
    enabled: input.enabled !== false,
    customerId: String(input.customerId || "").trim(),
    customerName: String(input.customerName || "").trim(),
    customerEmail: String(input.customerEmail || "").trim().toLowerCase(),
    frequency: String(input.frequency || "monthly"),
    interval: Math.max(1, Number(input.interval) || 1),
    nextRunDate: String(input.nextRunDate || isoDate(new Date())),
    lineItems: Array.isArray(input.lineItems) ? input.lineItems : [],
    currency: String(input.currency || "AUD").toUpperCase(),
    terms: String(input.terms || "Payment due within 7 days.").slice(0, 1000),
    templateId: String(input.templateId || "").trim() || undefined,
    updatedAt: new Date().toISOString(),
  };
  const i = rules.findIndex((r) => r.id === id);
  if (i === -1) rules.unshift(row);
  else rules[i] = { ...rules[i], ...row };
  writeInvoiceRecurringRules({ rules });
  return row;
}

function advanceDate(rule) {
  const base = new Date(`${rule.nextRunDate}T00:00:00.000Z`);
  const step = rule.frequency === "weekly" ? 7 * rule.interval : 30 * rule.interval;
  return isoDate(addDays(base, step));
}

export function runRecurringBilling(now = new Date()) {
  const today = isoDate(now);
  const data = readInvoiceRecurringRules();
  const rules = Array.isArray(data.rules) ? data.rules : [];
  const created = [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!rule.nextRunDate || rule.nextRunDate > today) continue;
    const alreadyToday = listInvoices().some(
      (inv) => inv.recurringRuleId === rule.id && String(inv.date || "").slice(0, 10) === today,
    );
    if (alreadyToday) continue;
    const invoice = createInvoice({
      customerId: rule.customerId,
      customerName: rule.customerName,
      customerEmail: rule.customerEmail,
      date: today,
      dueDate: isoDate(addDays(now, 7)),
      lineItems: rule.lineItems,
      service: "Recurring service",
      status: "sent",
      currency: rule.currency || "AUD",
      terms: rule.terms,
      templateId: rule.templateId,
      recurringRuleId: rule.id,
    });
    created.push(invoice);
    rule.nextRunDate = advanceDate(rule);
    rule.lastRunAt = new Date().toISOString();
  }
  writeInvoiceRecurringRules({ rules });
  return { ok: true, createdCount: created.length, invoices: created };
}
