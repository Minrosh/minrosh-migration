import { randomUUID, createHash, timingSafeEqual } from "node:crypto";
import {
  readInvoiceBankDetails,
  readInvoiceExpenses,
  readInvoiceFxRates,
  readInvoicePayments,
  readInvoiceTemplates,
  readInvoiceTimeEntries,
  readInvoices,
  writeInvoiceBankDetails,
  writeInvoiceExpenses,
  writeInvoiceFxRates,
  writeInvoicePayments,
  writeInvoiceTemplates,
  writeInvoiceTimeEntries,
  writeInvoices,
} from "./json-store";
import { withInvoiceMutationLock } from "./invoice-file-lock";
import { MINROSH_BANK_DEFAULT, MINROSH_ISSUER_DEFAULT, MINROSH_TERMS_DEFAULT } from "./invoice-defaults";

const DEFAULT_STATUS = "draft";
const VALID_STATUSES = new Set(["draft", "sent", "partial", "overdue", "paid", "void", "pending"]);

function nextInvoiceNumber(invoices) {
  const year = new Date().getFullYear();
  const nums = invoices
    .map((inv) => inv.invoiceNumber)
    .filter(Boolean)
    .map((n) => {
      const m = String(n).match(/^(\d{4})-(\d+)/);
      return m && m[1] === String(year) ? parseInt(m[2], 10) : 0;
    });
  const max = nums.length ? Math.max(...nums) : 0;
  return `${year}-${String(max + 1).padStart(4, "0")}`;
}

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCurrency(code) {
  const cur = String(code || "AUD").trim().toUpperCase();
  return cur || "AUD";
}

function normalizeStatus(status) {
  const s = String(status || DEFAULT_STATUS).trim().toLowerCase();
  if (!s) return DEFAULT_STATUS;
  return VALID_STATUSES.has(s) ? s : DEFAULT_STATUS;
}

function sanitizeLines(lines, fallbackLabel) {
  const list = Array.isArray(lines) ? lines : [];
  const out = list
    .map((line, idx) => {
      const qty = toNumber(line.quantity ?? 1, 1);
      const unitPrice = toNumber(line.unitPrice ?? line.amount ?? 0, 0);
      const label = String(line.description || line.label || fallbackLabel || `Item ${idx + 1}`).slice(0, 300);
      const amount = Number((qty * unitPrice).toFixed(2));
      const taxRate = toNumber(line.taxRate, 0);
      const taxAmount = Number((amount * taxRate).toFixed(2));
      return {
        id: String(line.id || `line-${idx + 1}`),
        description: label,
        quantity: qty,
        unitPrice,
        amount,
        taxRate,
        taxAmount,
      };
    })
    .filter((x) => x.description);
  return out.length ? out : [{ id: "line-1", description: String(fallbackLabel || "Service"), quantity: 1, unitPrice: 0, amount: 0, taxRate: 0, taxAmount: 0 }];
}

function normalizeTemplateLineDefaults(lines) {
  const list = Array.isArray(lines) ? lines : [];
  return list
    .map((line, idx) => ({
      description: String(line.description || line.label || `Item ${idx + 1}`).slice(0, 300),
      quantity: Math.max(0.01, toNumber(line.quantity ?? 1, 1)),
      unitPrice: Math.max(0, toNumber(line.unitPrice ?? line.amount ?? 0, 0)),
      taxRate: Math.max(0, toNumber(line.taxRate, 0.1)),
    }))
    .filter((line) => line.description);
}

function normalizeIssuer(input) {
  const src = input && typeof input === "object" ? input : {};
  return {
    businessName: String(src.businessName || MINROSH_ISSUER_DEFAULT.businessName).slice(0, 180),
    tradingName: String(src.tradingName || MINROSH_ISSUER_DEFAULT.tradingName || "").slice(0, 180),
    abn: String(src.abn || MINROSH_ISSUER_DEFAULT.abn || "").slice(0, 60),
    acn: String(src.acn || MINROSH_ISSUER_DEFAULT.acn || "").slice(0, 60),
    address: String(src.address || MINROSH_ISSUER_DEFAULT.address || "").slice(0, 220),
    phone: String(src.phone || MINROSH_ISSUER_DEFAULT.phone || "").slice(0, 80),
    email: String(src.email || MINROSH_ISSUER_DEFAULT.email || "").slice(0, 180),
    logoPath: String(src.logoPath || MINROSH_ISSUER_DEFAULT.logoPath || "").slice(0, 220),
    titleFontSize: Math.max(14, Math.min(32, toNumber(src.titleFontSize, MINROSH_ISSUER_DEFAULT.titleFontSize))),
    bodyFontSize: Math.max(8, Math.min(14, toNumber(src.bodyFontSize, MINROSH_ISSUER_DEFAULT.bodyFontSize))),
  };
}

function resolveTemplateByIdOrDefault(templateId) {
  const templates = readInvoiceTemplates().templates || [];
  if (templateId) {
    const picked = templates.find((t) => t.id === templateId);
    if (picked) return picked;
  }
  return templates.find((t) => t.isDefault) || null;
}

function calculateTotals(lines, discountAmount = 0) {
  const subtotal = Number(lines.reduce((acc, l) => acc + toNumber(l.amount), 0).toFixed(2));
  const taxTotal = Number(lines.reduce((acc, l) => acc + toNumber(l.taxAmount), 0).toFixed(2));
  const discount = Math.max(0, Number(toNumber(discountAmount, 0).toFixed(2)));
  const gross = Number((subtotal + taxTotal).toFixed(2));
  return {
    subtotal,
    discount,
    taxTotal,
    total: Number(Math.max(0, gross - discount).toFixed(2)),
    taxBreakdown: [{ label: "Tax total", amount: taxTotal }],
  };
}

function maskAccountNumber(raw) {
  const digits = String(raw || "").replace(/\s+/g, "");
  if (digits.length < 4) return digits;
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function readConfiguredBankDetails() {
  const file = readInvoiceBankDetails();
  const accountName = String(
    process.env.INVOICE_BANK_ACCOUNT_NAME || file.accountName || MINROSH_BANK_DEFAULT.accountName || ""
  ).trim();
  const bsb = String(process.env.INVOICE_BANK_BSB || file.bsb || MINROSH_BANK_DEFAULT.bsb || "").trim();
  const accountNumberRaw = String(process.env.INVOICE_BANK_ACCOUNT_NUMBER || "").trim();
  const accountNumber = accountNumberRaw
    ? accountNumberRaw
    : String(file.accountNumber || MINROSH_BANK_DEFAULT.accountNumber || "").trim();
  const accountNumberMasked = accountNumberRaw
    ? maskAccountNumber(accountNumberRaw)
    : String(file.accountNumberMasked || MINROSH_BANK_DEFAULT.accountNumberMasked || "").trim();
  const swift = String(process.env.INVOICE_BANK_SWIFT || file.swift || "").trim();
  const bankName = String(file.bankName || MINROSH_BANK_DEFAULT.bankName || "").trim();
  const paymentReferencePrefix = String(file.paymentReferencePrefix || MINROSH_BANK_DEFAULT.paymentReferencePrefix || "INV").trim() || "INV";
  const qrMode = String(file.qrMode || process.env.INVOICE_QR_MODE || "plain_text").trim().toLowerCase() === "npp_uri" ? "npp_uri" : "plain_text";
  return { accountName, bsb, accountNumber, accountNumberMasked, swift, bankName, paymentReferencePrefix, qrMode };
}

function applyTaxRules({ lines, customerCountry }) {
  const country = String(customerCountry || "AU").toUpperCase();
  const fallbackTaxRate = country === "AU" ? 0.1 : 0;
  return lines.map((line) => {
    if (line.taxRate) return line;
    const taxAmount = Number((toNumber(line.amount) * fallbackTaxRate).toFixed(2));
    return { ...line, taxRate: fallbackTaxRate, taxAmount };
  });
}

function fxRateFor(currency) {
  const c = normalizeCurrency(currency);
  if (c === "AUD") return 1;
  const fx = readInvoiceFxRates();
  const rows = Array.isArray(fx.rates) ? fx.rates : [];
  const found = rows.find((r) => String(r.code || "").toUpperCase() === c);
  return found ? toNumber(found.rate, 1) : 1;
}

export function listInvoices() {
  const { invoices } = readInvoices();
  return (invoices || []).map((inv) => {
    const total = toNumber(inv.total, inv.amount);
    return { ...inv, totalOutstanding: Math.max(0, Number((total - toNumber(inv.paidAmount)).toFixed(2))) };
  });
}

export function createInvoice({
  customerId,
  customerName,
  customerEmail,
  customerContact,
  customerAddress,
  customerCountry,
  date,
  dueDate,
  amount,
  service,
  status = DEFAULT_STATUS,
  lineItems,
  currency = "AUD",
  templateId,
  terms,
  notes,
  recurringRuleId,
  discount,
  discountDescription,
}) {
  return withInvoiceMutationLock(() => {
    const data = readInvoices();
    const invoices = [...(data.invoices || [])];
    let invoiceNumber = nextInvoiceNumber(invoices);
    if (invoices.some((inv) => inv.invoiceNumber === invoiceNumber)) {
      invoiceNumber = `${invoiceNumber}-${randomUUID().slice(0, 6)}`;
    }
    const fromTemplate = resolveTemplateByIdOrDefault(templateId);
    const templateLines = Array.isArray(fromTemplate?.lineDefaults) ? fromTemplate.lineDefaults : [];
    const inputLines = Array.isArray(lineItems) && lineItems.length ? lineItems : templateLines;
    let lines = sanitizeLines(inputLines, service);
    lines = applyTaxRules({ lines, customerCountry });
    const discountAmount = Math.max(0, toNumber(discount, 0));
    const totals = calculateTotals(lines, discountAmount);
    const rate = fxRateFor(currency);
    const row = {
      id: `inv-${randomUUID()}`,
      invoiceNumber,
      schemaVersion: 2,
      customerId: String(customerId || "").trim(),
      customerName: String(customerName || "").trim(),
      customerEmail: String(customerEmail || "").trim().toLowerCase(),
      customerContact: String(customerContact || customerEmail || "").trim(),
      customerAddress: String(customerAddress || "").slice(0, 300),
      date: String(date || new Date().toISOString().slice(0, 10)),
      dueDate: String(dueDate || date || new Date().toISOString().slice(0, 10)),
      currency: normalizeCurrency(currency),
      fxRateToAud: rate,
      service: String(service || "").trim(),
      lineItems: lines,
      ...totals,
      amount: Number(amount) || totals.total,
      discount: discountAmount,
      discountDescription: String(discountDescription || "").slice(0, 200),
      paidAmount: 0,
      status: normalizeStatus(status),
      terms: String(terms || fromTemplate?.defaultTerms || MINROSH_TERMS_DEFAULT).slice(0, 1000),
      notes: String(notes || "").slice(0, 2000),
      recurringRuleId: String(recurringRuleId || "").trim() || undefined,
      paymentInstructions: readConfiguredBankDetails(),
      issuer: normalizeIssuer({ ...MINROSH_ISSUER_DEFAULT, ...(fromTemplate?.issuer || {}) }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReminderAt: null,
    };
    writeInvoices({ invoices: [row, ...invoices] });
    return row;
  });
}

export function updateInvoiceStatus(id, status) {
  const data = readInvoices();
  const invoices = data.invoices || [];
  const i = invoices.findIndex((x) => x.id === id);
  if (i === -1) return null;
  invoices[i] = {
    ...invoices[i],
    status: normalizeStatus(status),
    updatedAt: new Date().toISOString(),
  };
  writeInvoices({ invoices });
  return invoices[i];
}

export function updateInvoice(id, patch = {}) {
  return withInvoiceMutationLock(() => {
    const data = readInvoices();
    const invoices = data.invoices || [];
    const i = invoices.findIndex((x) => x.id === id);
    if (i === -1) return null;
    const cur = invoices[i];
    const next = {
      ...cur,
      customerId: patch.customerId == null ? cur.customerId : String(patch.customerId || "").trim(),
      customerName: patch.customerName == null ? cur.customerName : String(patch.customerName || "").trim(),
      customerEmail: patch.customerEmail == null ? cur.customerEmail : String(patch.customerEmail || "").trim().toLowerCase(),
      customerContact:
        patch.customerContact == null ? cur.customerContact : String(patch.customerContact || "").trim(),
      customerAddress:
        patch.customerAddress == null ? cur.customerAddress : String(patch.customerAddress || "").slice(0, 300),
      discount: patch.discount == null ? toNumber(cur.discount, 0) : Math.max(0, toNumber(patch.discount, 0)),
      discountDescription:
        patch.discountDescription == null ? cur.discountDescription : String(patch.discountDescription || "").slice(0, 200),
      dueDate: patch.dueDate == null ? cur.dueDate : String(patch.dueDate || "").trim(),
      terms: patch.terms == null ? cur.terms : String(patch.terms || "").slice(0, 1000),
      notes: patch.notes == null ? cur.notes : String(patch.notes || "").slice(0, 2000),
      status: patch.status == null ? cur.status : normalizeStatus(patch.status),
      customerPortalTokenHash:
        patch.customerPortalTokenHash == null ? cur.customerPortalTokenHash : String(patch.customerPortalTokenHash || ""),
      lastReminderAt: patch.lastReminderAt == null ? cur.lastReminderAt : String(patch.lastReminderAt || ""),
      updatedAt: new Date().toISOString(),
    };
    if (patch.lineItems) {
      const taxed = applyTaxRules({ lines: sanitizeLines(patch.lineItems, next.service), customerCountry: patch.customerCountry });
      const totals = calculateTotals(taxed, next.discount);
      Object.assign(next, { lineItems: taxed, ...totals, amount: totals.total });
    }
    invoices[i] = next;
    writeInvoices({ invoices });
    return next;
  });
}

export function recordPayment({ invoiceId, amount, method = "bank_transfer", reference = "", paidAt }) {
  return withInvoiceMutationLock(() => {
    const data = readInvoices();
    const invoices = data.invoices || [];
    const i = invoices.findIndex((x) => x.id === invoiceId);
    if (i === -1) return null;
    const row = invoices[i];
    const paymentAmount = Math.max(0, toNumber(amount, 0));
    const pay = {
      id: `pay-${randomUUID()}`,
      invoiceId,
      amount: paymentAmount,
      method: String(method || "bank_transfer").slice(0, 80),
      reference: String(reference || "").slice(0, 180),
      paidAt: String(paidAt || new Date().toISOString()),
      createdAt: new Date().toISOString(),
    };
    const payments = readInvoicePayments();
    const list = Array.isArray(payments.payments) ? payments.payments : [];
    list.unshift(pay);
    writeInvoicePayments({ payments: list.slice(0, 10000) });

    const nextPaid = Number((toNumber(row.paidAmount) + paymentAmount).toFixed(2));
    const total = toNumber(row.total, row.amount);
    const nextStatus = nextPaid <= 0 ? row.status : nextPaid >= total ? "paid" : "partial";
    invoices[i] = { ...row, paidAmount: nextPaid, status: nextStatus, updatedAt: new Date().toISOString() };
    writeInvoices({ invoices });
    return { invoice: invoices[i], payment: pay };
  });
}

export function listPayments({ invoiceId } = {}) {
  const data = readInvoicePayments();
  const rows = Array.isArray(data.payments) ? data.payments : [];
  if (!invoiceId) return rows;
  return rows.filter((p) => p.invoiceId === invoiceId);
}

export function listTemplates() {
  const data = readInvoiceTemplates();
  return Array.isArray(data.templates) ? data.templates : [];
}

export function upsertTemplate(template) {
  return withInvoiceMutationLock(() => {
    const data = readInvoiceTemplates();
    const list = Array.isArray(data.templates) ? data.templates : [];
    const id = String(template.id || `tpl-${randomUUID()}`);
    const row = {
      id,
      name: String(template.name || "Untitled template").slice(0, 120),
      currency: normalizeCurrency(template.currency || "AUD"),
      defaultTerms: String(template.defaultTerms || "").slice(0, 1000),
      issuer: normalizeIssuer(template.issuer),
      lineDefaults: normalizeTemplateLineDefaults(template.lineDefaults),
      isDefault: Boolean(template.isDefault),
      updatedAt: new Date().toISOString(),
    };
    if (row.isDefault) {
      for (let j = 0; j < list.length; j += 1) list[j] = { ...list[j], isDefault: false };
    }
    const i = list.findIndex((x) => x.id === id);
    if (i === -1) list.unshift(row);
    else list[i] = { ...list[i], ...row };
    writeInvoiceTemplates({ templates: list });
    return row;
  });
}

export function deleteTemplate(templateId) {
  return withInvoiceMutationLock(() => {
    const id = String(templateId || "").trim();
    if (!id) return { ok: false, removed: false, templates: listTemplates() };
    const data = readInvoiceTemplates();
    const list = Array.isArray(data.templates) ? data.templates : [];
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0) return { ok: false, removed: false, templates: list };
    const removed = list[idx];
    const next = list.filter((t) => t.id !== id);
    if (!next.some((t) => t.isDefault) && next.length > 0) {
      next[0] = { ...next[0], isDefault: true };
    }
    writeInvoiceTemplates({ templates: next });
    return { ok: true, removed: true, template: removed, templates: next };
  });
}

export function duplicateTemplate(templateId) {
  return withInvoiceMutationLock(() => {
    const id = String(templateId || "").trim();
    const data = readInvoiceTemplates();
    const list = Array.isArray(data.templates) ? data.templates : [];
    const base = list.find((t) => t.id === id);
    if (!base) return null;
    const copy = {
      ...base,
      id: `tpl-${randomUUID()}`,
      name: `${base.name} (Copy)`.slice(0, 120),
      isDefault: false,
      updatedAt: new Date().toISOString(),
    };
    const next = [copy, ...list];
    writeInvoiceTemplates({ templates: next });
    return { template: copy, templates: next };
  });
}

export function getBankDetails() {
  return readConfiguredBankDetails();
}

export function setBankDetails(input) {
  const current = readConfiguredBankDetails();
  const accountNumber = String((input.accountNumber ?? current.accountNumber) || "").replace(/\s+/g, "");
  const next = {
    accountName: String((input.accountName ?? current.accountName) || "").trim(),
    bsb: String((input.bsb ?? current.bsb) || "").trim(),
    accountNumber,
    accountNumberMasked: maskAccountNumber(String(input.accountNumberMasked || input.accountNumber || current.accountNumberMasked || accountNumber)),
    swift: String((input.swift ?? current.swift) || "").trim(),
    bankName: String((input.bankName ?? current.bankName) || "").trim(),
    paymentReferencePrefix: String((input.paymentReferencePrefix ?? current.paymentReferencePrefix) || "INV").trim() || "INV",
    qrMode: String((input.qrMode ?? current.qrMode) || "plain_text").trim().toLowerCase() === "npp_uri" ? "npp_uri" : "plain_text",
  };
  writeInvoiceBankDetails(next);
  return next;
}

export function attachTimeAndExpenses({ invoiceId, timeEntryIds, expenseIds }) {
  return withInvoiceMutationLock(() => {
    const data = readInvoices();
    const invoices = data.invoices || [];
    const i = invoices.findIndex((x) => x.id === invoiceId);
    if (i === -1) return null;
    const times = readInvoiceTimeEntries();
    const expenses = readInvoiceExpenses();
    const timeSet = new Set(Array.isArray(timeEntryIds) ? timeEntryIds : []);
    const expSet = new Set(Array.isArray(expenseIds) ? expenseIds : []);
    const matchedTimes = (times.entries || []).filter((x) => timeSet.has(x.id));
    const matchedExpenses = (expenses.expenses || []).filter((x) => expSet.has(x.id));
    const existing = Array.isArray(invoices[i].lineItems) ? invoices[i].lineItems : [];
    const fromTime = matchedTimes.map((t) => ({
      id: `time-${t.id}`,
      description: String(t.description || "Billable time"),
      quantity: toNumber(t.hours, 0),
      unitPrice: toNumber(t.rate, 0),
      amount: Number((toNumber(t.hours, 0) * toNumber(t.rate, 0)).toFixed(2)),
      taxRate: toNumber(t.taxRate, 0),
      taxAmount: Number((toNumber(t.hours, 0) * toNumber(t.rate, 0) * toNumber(t.taxRate, 0)).toFixed(2)),
    }));
    const fromExpenses = matchedExpenses.map((e) => ({
      id: `exp-${e.id}`,
      description: String(e.description || "Expense"),
      quantity: 1,
      unitPrice: toNumber(e.amount, 0),
      amount: toNumber(e.amount, 0),
      taxRate: toNumber(e.taxRate, 0),
      taxAmount: Number((toNumber(e.amount, 0) * toNumber(e.taxRate, 0)).toFixed(2)),
    }));
    const nextLines = [...existing, ...fromTime, ...fromExpenses];
    const totals = calculateTotals(nextLines);
    invoices[i] = {
      ...invoices[i],
      lineItems: nextLines,
      ...totals,
      amount: totals.total,
      linkedTimeEntryIds: [...timeSet],
      linkedExpenseIds: [...expSet],
      updatedAt: new Date().toISOString(),
    };
    writeInvoices({ invoices });
    return invoices[i];
  });
}

export function getInvoice(id) {
  return listInvoices().find((x) => x.id === id) || null;
}

export function listInvoiceTimeEntries() {
  const data = readInvoiceTimeEntries();
  return Array.isArray(data.entries) ? data.entries : [];
}

export function createInvoiceTimeEntry(entry) {
  const data = readInvoiceTimeEntries();
  const rows = Array.isArray(data.entries) ? data.entries : [];
  const row = {
    id: `te-${randomUUID()}`,
    customerId: String(entry.customerId || "").trim(),
    description: String(entry.description || "").slice(0, 240),
    hours: toNumber(entry.hours, 0),
    rate: toNumber(entry.rate, 0),
    taxRate: toNumber(entry.taxRate, 0.1),
    at: String(entry.at || new Date().toISOString()),
  };
  rows.unshift(row);
  writeInvoiceTimeEntries({ entries: rows.slice(0, 10000) });
  return row;
}

export function listInvoiceExpenses() {
  const data = readInvoiceExpenses();
  return Array.isArray(data.expenses) ? data.expenses : [];
}

export function createInvoiceExpense(entry) {
  const data = readInvoiceExpenses();
  const rows = Array.isArray(data.expenses) ? data.expenses : [];
  const row = {
    id: `ex-${randomUUID()}`,
    customerId: String(entry.customerId || "").trim(),
    description: String(entry.description || "").slice(0, 240),
    amount: toNumber(entry.amount, 0),
    taxRate: toNumber(entry.taxRate, 0.1),
    category: String(entry.category || "general").slice(0, 100),
    at: String(entry.at || new Date().toISOString()),
  };
  rows.unshift(row);
  writeInvoiceExpenses({ expenses: rows.slice(0, 10000) });
  return row;
}

export function setFxRate({ code, rate, asOf, source }) {
  const data = readInvoiceFxRates();
  const rows = Array.isArray(data.rates) ? data.rates : [];
  const cur = normalizeCurrency(code);
  const row = {
    code: cur,
    rate: toNumber(rate, 1),
    asOf: String(asOf || new Date().toISOString()),
    source: String(source || "manual").slice(0, 120),
  };
  const i = rows.findIndex((r) => String(r.code || "").toUpperCase() === cur);
  if (i === -1) rows.unshift(row);
  else rows[i] = row;
  writeInvoiceFxRates({ ...data, rates: rows.slice(0, 200) });
  return row;
}

export function createPortalAccessToken(invoiceId) {
  const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
  const hash = createHash("sha256").update(token).digest("hex");
  const row = updateInvoice(invoiceId, { customerPortalTokenHash: hash });
  if (!row) return null;
  return { token, invoice: row };
}

export function getInvoiceByPortalToken(token) {
  const hash = createHash("sha256").update(String(token || "")).digest("hex");
  for (const inv of listInvoices()) {
    const stored = String(inv.customerPortalTokenHash || "");
    if (!stored || stored.length !== hash.length) continue;
    const a = Buffer.from(stored);
    const b = Buffer.from(hash);
    if (a.length === b.length && timingSafeEqual(a, b)) return inv;
  }
  return null;
}

export function markReminderSent(invoiceId, reminderId) {
  const row = updateInvoice(invoiceId, { lastReminderAt: new Date().toISOString() });
  if (!row) return null;
  return { invoice: row, reminderId: String(reminderId || "") };
}
