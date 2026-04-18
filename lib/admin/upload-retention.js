import { readCustomers } from "@/lib/admin/json-store";
import { deleteCustomerUploadFolder } from "@/lib/admin/uploads-storage";

const DEFAULT_DAYS = 30;

export function getUploadRetentionDays() {
  const n = Number(process.env.UPLOAD_RETENTION_DAYS);
  if (Number.isFinite(n) && n > 0) return Math.min(3650, Math.floor(n));
  return DEFAULT_DAYS;
}

/**
 * Delete private upload folders for customers whose case was closed longer than the retention window.
 * Requires each customer to have `caseClosedAt` (ISO) set (e.g. via Admin → Customers PATCH).
 * @returns {{ days: number, purgedCustomerIds: string[], errors: number }}
 */
export function runClosedCaseUploadRetention() {
  const days = getUploadRetentionDays();
  const threshold = Date.now() - days * 86_400_000;
  const { customers } = readCustomers();
  const list = Array.isArray(customers) ? customers : [];
  const purgedCustomerIds = [];
  let errors = 0;
  for (const c of list) {
    if (!c || typeof c !== "object") continue;
    const raw = c.caseClosedAt;
    if (!raw) continue;
    const closed = new Date(String(raw)).getTime();
    if (!Number.isFinite(closed) || closed > threshold) continue;
    try {
      deleteCustomerUploadFolder(c);
      purgedCustomerIds.push(String(c.id || ""));
    } catch {
      errors += 1;
    }
  }
  return { days, purgedCustomerIds: purgedCustomerIds.filter(Boolean), errors };
}
