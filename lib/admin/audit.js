import { randomUUID } from "node:crypto";
import { readAudit, writeAudit } from "./json-store";

export function appendAudit(action, detail = "") {
  const log = readAudit();
  const entries = Array.isArray(log.entries) ? log.entries : [];
  entries.unshift({
    id: randomUUID(),
    action,
    detail: String(detail).slice(0, 2000),
    createdAt: new Date().toISOString(),
  });
  writeAudit({ entries: entries.slice(0, 500) });
}
