import path from "node:path";

export const dataDir = path.join(process.cwd(), "data");
export const customersFile = path.join(dataDir, "customers.json");
export const invoicesFile = path.join(dataDir, "invoices.json");
export const auditFile = path.join(dataDir, "audit-log.json");
export const successStoriesAdminFile = path.join(dataDir, "success-stories.json");
export const adminAuthFile = path.join(dataDir, "admin-auth.json");
export const invoiceTemplatesFile = path.join(dataDir, "invoice-templates.json");
export const invoiceRecurringRulesFile = path.join(dataDir, "invoice-recurring-rules.json");
export const invoiceReminderRulesFile = path.join(dataDir, "invoice-reminder-rules.json");
export const invoiceTimeEntriesFile = path.join(dataDir, "invoice-time-entries.json");
export const invoiceExpensesFile = path.join(dataDir, "invoice-expenses.json");
export const invoicePosFile = path.join(dataDir, "invoice-pos.json");
export const invoiceGrnsFile = path.join(dataDir, "invoice-grns.json");
export const invoicePaymentsFile = path.join(dataDir, "invoice-payments.json");
export const invoiceBankDetailsFile = path.join(dataDir, "invoice-bank-details.json");
export const invoiceFxRatesFile = path.join(dataDir, "invoice-fx-rates.json");
export const invoiceSyncJobsFile = path.join(dataDir, "invoice-sync-jobs.json");
export const intelligenceSourcesFile = path.join(dataDir, "intelligence-sources.json");
export const intelligenceEventsFile = path.join(dataDir, "intelligence-events.json");
export const intelligenceDraftsFile = path.join(dataDir, "intelligence-drafts.json");
export const adminAlertsFile = path.join(dataDir, "admin-alerts.json");
export const intelligenceFaqPatchesFile = path.join(dataDir, "intelligence-faq-patches.json");
export const socialFacebookPostsFile = path.join(dataDir, "social-facebook-posts.json");
export const intelligencePublishHistoryFile = path.join(dataDir, "intelligence-publish-history.json");
export const intelligenceChannelQueueFile = path.join(dataDir, "intelligence-channel-queue.json");
export const socialDmLeadsFile = path.join(dataDir, "social-dm-leads.json");

/** CRM extension stores (JSON operational layer; Sheets sync optional later). */
export const crmInteractionsFile = path.join(dataDir, "crm-interactions.json");
export const crmLeadsFile = path.join(dataDir, "crm-leads.json");
export const crmOpportunitiesFile = path.join(dataDir, "crm-opportunities.json");
export const crmTasksFile = path.join(dataDir, "crm-tasks.json");
export const crmAutomationsFile = path.join(dataDir, "crm-automations.json");
export const crmConversationsFile = path.join(dataDir, "crm-conversations.json");
export const crmQuotesFile = path.join(dataDir, "crm-quotes.json");

export const customersSeed = path.join(dataDir, "customers.seed.json");
export const invoicesSeed = path.join(dataDir, "invoices.seed.json");
export const auditSeed = path.join(dataDir, "audit-log.seed.json");
export const successStoriesSeed = path.join(dataDir, "success-stories.seed.json");
export const invoiceTemplatesSeed = path.join(dataDir, "invoice-templates.seed.json");
export const invoiceRecurringRulesSeed = path.join(dataDir, "invoice-recurring-rules.seed.json");
export const invoiceReminderRulesSeed = path.join(dataDir, "invoice-reminder-rules.seed.json");
export const invoiceTimeEntriesSeed = path.join(dataDir, "invoice-time-entries.seed.json");
export const invoiceExpensesSeed = path.join(dataDir, "invoice-expenses.seed.json");
export const invoicePosSeed = path.join(dataDir, "invoice-pos.seed.json");
export const invoiceGrnsSeed = path.join(dataDir, "invoice-grns.seed.json");
export const invoicePaymentsSeed = path.join(dataDir, "invoice-payments.seed.json");
export const invoiceBankDetailsSeed = path.join(dataDir, "invoice-bank-details.seed.json");
export const invoiceFxRatesSeed = path.join(dataDir, "invoice-fx-rates.seed.json");
export const invoiceSyncJobsSeed = path.join(dataDir, "invoice-sync-jobs.seed.json");

/** Private customer uploads (not web-served as static files). */
export const storageUploadsDir = path.join(process.cwd(), "storage", "uploads");
/** Used by json-store ensureUploadsDir — private storage. */
export const uploadsDir = storageUploadsDir;
