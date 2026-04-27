import fs from "node:fs";
import path from "node:path";
import { writeJsonAtomic, readJsonFile } from "../contact";
import {
  auditFile,
  auditSeed,
  customersFile,
  customersSeed,
  invoiceBankDetailsFile,
  invoiceBankDetailsSeed,
  invoiceExpensesFile,
  invoiceExpensesSeed,
  invoiceFxRatesFile,
  invoiceFxRatesSeed,
  invoiceGrnsFile,
  invoiceGrnsSeed,
  invoicesFile,
  invoicesSeed,
  invoicePaymentsFile,
  invoicePaymentsSeed,
  invoicePosFile,
  invoicePosSeed,
  invoiceRecurringRulesFile,
  invoiceRecurringRulesSeed,
  invoiceReminderRulesFile,
  invoiceReminderRulesSeed,
  invoiceSyncJobsFile,
  invoiceSyncJobsSeed,
  invoiceTemplatesFile,
  invoiceTemplatesSeed,
  invoiceTimeEntriesFile,
  invoiceTimeEntriesSeed,
  cronRunsFile,
  successStoriesAdminFile,
  successStoriesSeed,
  uploadsDir,
} from "./paths";

function ensureFromSeed(filePath, seedPath, emptyFallback) {
  if (fs.existsSync(filePath)) return;
  if (fs.existsSync(seedPath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.copyFileSync(seedPath, filePath);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeJsonAtomic(filePath, emptyFallback);
}

export function ensureCustomersFile() {
  ensureFromSeed(customersFile, customersSeed, { customers: [] });
}

export function ensureInvoicesFile() {
  ensureFromSeed(invoicesFile, invoicesSeed, { invoices: [] });
}

export function ensureAuditFile() {
  ensureFromSeed(auditFile, auditSeed, { entries: [] });
}

export function ensureInvoiceTemplatesFile() {
  ensureFromSeed(invoiceTemplatesFile, invoiceTemplatesSeed, { templates: [] });
}

export function ensureInvoiceRecurringRulesFile() {
  ensureFromSeed(invoiceRecurringRulesFile, invoiceRecurringRulesSeed, { rules: [] });
}

export function ensureInvoiceReminderRulesFile() {
  ensureFromSeed(invoiceReminderRulesFile, invoiceReminderRulesSeed, { rules: [] });
}

export function ensureInvoiceTimeEntriesFile() {
  ensureFromSeed(invoiceTimeEntriesFile, invoiceTimeEntriesSeed, { entries: [] });
}

export function ensureInvoiceExpensesFile() {
  ensureFromSeed(invoiceExpensesFile, invoiceExpensesSeed, { expenses: [] });
}

export function ensureInvoicePosFile() {
  ensureFromSeed(invoicePosFile, invoicePosSeed, { purchaseOrders: [] });
}

export function ensureInvoiceGrnsFile() {
  ensureFromSeed(invoiceGrnsFile, invoiceGrnsSeed, { grns: [] });
}

export function ensureInvoicePaymentsFile() {
  ensureFromSeed(invoicePaymentsFile, invoicePaymentsSeed, { payments: [] });
}

export function ensureInvoiceBankDetailsFile() {
  ensureFromSeed(invoiceBankDetailsFile, invoiceBankDetailsSeed, {
    accountName: "",
    bsb: "",
    accountNumber: "",
    accountNumberMasked: "",
    swift: "",
    bankName: "",
    paymentReferencePrefix: "INV",
  });
}

export function ensureInvoiceFxRatesFile() {
  ensureFromSeed(invoiceFxRatesFile, invoiceFxRatesSeed, { baseCurrency: "AUD", rates: [] });
}

export function ensureInvoiceSyncJobsFile() {
  ensureFromSeed(invoiceSyncJobsFile, invoiceSyncJobsSeed, { jobs: [] });
}

export function ensureSuccessStoriesFile() {
  ensureFromSeed(successStoriesAdminFile, successStoriesSeed, { stories: [] });
}

export function ensureCronRunsFile() {
  if (fs.existsSync(cronRunsFile)) return;
  fs.mkdirSync(path.dirname(cronRunsFile), { recursive: true });
  writeJsonAtomic(cronRunsFile, { runs: [] });
}

export function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export function readCustomers() {
  ensureCustomersFile();
  return readJsonFile(customersFile, { customers: [] });
}

function scheduleSupabaseCustomersMirror(data) {
  queueMicrotask(() => {
    import("../supabase/crm-dual-write.js")
      .then((m) => m.dualWriteCustomersStoreToSupabase(data))
      .catch(() => {});
  });
}

function scheduleSupabaseInvoicesMirror(data) {
  queueMicrotask(() => {
    import("../supabase/crm-dual-write.js")
      .then((m) => m.dualWriteInvoicesStoreToSupabase(data))
      .catch(() => {});
  });
}

export function writeCustomers(data) {
  writeJsonAtomic(customersFile, data);
  scheduleSupabaseCustomersMirror(data);
}

export function readInvoices() {
  ensureInvoicesFile();
  return readJsonFile(invoicesFile, { invoices: [] });
}

export function writeInvoices(data) {
  writeJsonAtomic(invoicesFile, data);
  scheduleSupabaseInvoicesMirror(data);
}

export function readInvoiceTemplates() {
  ensureInvoiceTemplatesFile();
  return readJsonFile(invoiceTemplatesFile, { templates: [] });
}

export function writeInvoiceTemplates(data) {
  writeJsonAtomic(invoiceTemplatesFile, data);
}

export function readInvoiceRecurringRules() {
  ensureInvoiceRecurringRulesFile();
  return readJsonFile(invoiceRecurringRulesFile, { rules: [] });
}

export function writeInvoiceRecurringRules(data) {
  writeJsonAtomic(invoiceRecurringRulesFile, data);
}

export function readInvoiceReminderRules() {
  ensureInvoiceReminderRulesFile();
  return readJsonFile(invoiceReminderRulesFile, { rules: [] });
}

export function writeInvoiceReminderRules(data) {
  writeJsonAtomic(invoiceReminderRulesFile, data);
}

export function readInvoiceTimeEntries() {
  ensureInvoiceTimeEntriesFile();
  return readJsonFile(invoiceTimeEntriesFile, { entries: [] });
}

export function writeInvoiceTimeEntries(data) {
  writeJsonAtomic(invoiceTimeEntriesFile, data);
}

export function readInvoiceExpenses() {
  ensureInvoiceExpensesFile();
  return readJsonFile(invoiceExpensesFile, { expenses: [] });
}

export function writeInvoiceExpenses(data) {
  writeJsonAtomic(invoiceExpensesFile, data);
}

export function readInvoicePos() {
  ensureInvoicePosFile();
  return readJsonFile(invoicePosFile, { purchaseOrders: [] });
}

export function writeInvoicePos(data) {
  writeJsonAtomic(invoicePosFile, data);
}

export function readInvoiceGrns() {
  ensureInvoiceGrnsFile();
  return readJsonFile(invoiceGrnsFile, { grns: [] });
}

export function writeInvoiceGrns(data) {
  writeJsonAtomic(invoiceGrnsFile, data);
}

export function readInvoicePayments() {
  ensureInvoicePaymentsFile();
  return readJsonFile(invoicePaymentsFile, { payments: [] });
}

export function writeInvoicePayments(data) {
  writeJsonAtomic(invoicePaymentsFile, data);
}

export function readInvoiceBankDetails() {
  ensureInvoiceBankDetailsFile();
  return readJsonFile(invoiceBankDetailsFile, {
    accountName: "",
    bsb: "",
    accountNumber: "",
    accountNumberMasked: "",
    swift: "",
    bankName: "",
    paymentReferencePrefix: "INV",
  });
}

export function writeInvoiceBankDetails(data) {
  writeJsonAtomic(invoiceBankDetailsFile, data);
}

export function readInvoiceFxRates() {
  ensureInvoiceFxRatesFile();
  return readJsonFile(invoiceFxRatesFile, { baseCurrency: "AUD", rates: [] });
}

export function writeInvoiceFxRates(data) {
  writeJsonAtomic(invoiceFxRatesFile, data);
}

export function readInvoiceSyncJobs() {
  ensureInvoiceSyncJobsFile();
  return readJsonFile(invoiceSyncJobsFile, { jobs: [] });
}

export function writeInvoiceSyncJobs(data) {
  writeJsonAtomic(invoiceSyncJobsFile, data);
}

export function readAudit() {
  ensureAuditFile();
  return readJsonFile(auditFile, { entries: [] });
}

export function writeAudit(data) {
  writeJsonAtomic(auditFile, data);
}

export function readAdminSuccessStories() {
  ensureSuccessStoriesFile();
  return readJsonFile(successStoriesAdminFile, { stories: [] });
}

export function writeAdminSuccessStories(data) {
  writeJsonAtomic(successStoriesAdminFile, data);
}

export function readCronRuns() {
  ensureCronRunsFile();
  return readJsonFile(cronRunsFile, { runs: [] });
}

export function writeCronRuns(data) {
  writeJsonAtomic(cronRunsFile, data);
}
