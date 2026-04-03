import path from "node:path";

export const dataDir = path.join(process.cwd(), "data");
export const customersFile = path.join(dataDir, "customers.json");
export const invoicesFile = path.join(dataDir, "invoices.json");
export const auditFile = path.join(dataDir, "audit-log.json");
export const successStoriesAdminFile = path.join(dataDir, "success-stories.json");

export const customersSeed = path.join(dataDir, "customers.seed.json");
export const invoicesSeed = path.join(dataDir, "invoices.seed.json");
export const auditSeed = path.join(dataDir, "audit-log.seed.json");
export const successStoriesSeed = path.join(dataDir, "success-stories.seed.json");

export const uploadsDir = path.join(process.cwd(), "public", "uploads");
