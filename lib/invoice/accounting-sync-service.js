import { randomUUID } from "node:crypto";
import { listInvoices } from "@/lib/admin/invoices-service";
import { readInvoiceSyncJobs, writeInvoiceSyncJobs } from "@/lib/admin/json-store";

export function listSyncJobs() {
  const data = readInvoiceSyncJobs();
  return Array.isArray(data.jobs) ? data.jobs : [];
}

export function queueAccountingSync({ provider = "xero", invoiceIds }) {
  const ids = Array.isArray(invoiceIds) && invoiceIds.length ? invoiceIds : listInvoices().slice(0, 100).map((i) => i.id);
  const row = {
    id: `sync-${randomUUID()}`,
    provider: String(provider || "xero").slice(0, 40),
    invoiceIds: ids,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  const data = readInvoiceSyncJobs();
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  jobs.unshift(row);
  writeInvoiceSyncJobs({ jobs: jobs.slice(0, 5000) });
  return row;
}

export function runAccountingSync(provider = "xero") {
  const data = readInvoiceSyncJobs();
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  const queued = jobs.filter((j) => j.status === "queued" && j.provider === provider);
  for (const job of queued) {
    job.status = "done";
    job.finishedAt = new Date().toISOString();
    job.export = {
      provider,
      records: (job.invoiceIds || []).map((id) => ({ externalId: id, status: "exported" })),
    };
  }
  writeInvoiceSyncJobs({ jobs });
  return { ok: true, processed: queued.length };
}
