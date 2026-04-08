import path from "node:path";

export const dataDir = path.join(process.cwd(), "data");
export const customersFile = path.join(dataDir, "customers.json");
export const invoicesFile = path.join(dataDir, "invoices.json");
export const auditFile = path.join(dataDir, "audit-log.json");
export const successStoriesAdminFile = path.join(dataDir, "success-stories.json");
export const adminAuthFile = path.join(dataDir, "admin-auth.json");

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

/** Private customer uploads (not web-served as static files). */
export const storageUploadsDir = path.join(process.cwd(), "storage", "uploads");
/** Used by json-store ensureUploadsDir — private storage. */
export const uploadsDir = storageUploadsDir;
