import { listInvoices, markReminderSent } from "@/lib/admin/invoices-service";
import { readInvoiceReminderRules, writeInvoiceReminderRules } from "@/lib/admin/json-store";

function dayDiff(a, b) {
  const ms = new Date(a).setUTCHours(0, 0, 0, 0) - new Date(b).setUTCHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function listReminderRules() {
  const data = readInvoiceReminderRules();
  return Array.isArray(data.rules) ? data.rules : [];
}

export function upsertReminderRule(input) {
  const data = readInvoiceReminderRules();
  const rules = Array.isArray(data.rules) ? data.rules : [];
  const id = String(input.id || `rem-${Date.now()}`);
  const row = {
    id,
    enabled: input.enabled !== false,
    offsetDays: Number(input.offsetDays) || 0,
    channel: String(input.channel || "email"),
    template: String(input.template || "Friendly payment reminder").slice(0, 500),
  };
  const i = rules.findIndex((r) => r.id === id);
  if (i === -1) rules.unshift(row);
  else rules[i] = { ...rules[i], ...row };
  writeInvoiceReminderRules({ rules });
  return row;
}

export function runInvoiceReminders(now = new Date()) {
  const today = new Date(now);
  const rules = listReminderRules().filter((r) => r.enabled);
  const reminders = [];
  for (const inv of listInvoices()) {
    if (!inv.dueDate || ["paid", "void", "draft"].includes(inv.status)) continue;
    const dueDelta = dayDiff(inv.dueDate, today);
    for (const rule of rules) {
      if (Number(rule.offsetDays) !== dueDelta) continue;
      const key = `${inv.id}:${rule.id}:${today.toISOString().slice(0, 10)}`;
      reminders.push({
        id: `reminder-${key}`,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerEmail: inv.customerEmail || "",
        channel: rule.channel,
        message: rule.template,
        dueDate: inv.dueDate,
      });
      markReminderSent(inv.id, rule.id);
    }
  }
  return { ok: true, sentCount: reminders.length, reminders };
}
