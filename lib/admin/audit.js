import { randomUUID } from "node:crypto";
import path from "node:path";
import { withMutationLock } from "../json-mutation-lock";
import { auditFile } from "./paths";
import { readAudit, writeAudit } from "./json-store";
import { getAdminRole } from "./permissions";

function auditLockPath() {
  return path.join(path.dirname(auditFile), ".audit-mutation.lock");
}

/**
 * @param {string} action
 * @param {string} [detail]
 * @param {{ ip?: string, route?: string, requestId?: string, actor?: string }} [context]
 */
export function appendAudit(action, detail = "", context = {}) {
  withMutationLock(auditLockPath(), () => {
    const log = readAudit();
    const entries = Array.isArray(log.entries) ? log.entries : [];
    const ctx = context && typeof context === "object" ? context : {};
    const actor = ctx.actor ? String(ctx.actor).slice(0, 120) : getAdminRole();
    entries.unshift({
      id: randomUUID(),
      action,
      detail: String(detail).slice(0, 2000),
      createdAt: new Date().toISOString(),
      actor,
      ...(ctx.ip ? { ip: String(ctx.ip).slice(0, 80) } : {}),
      ...(ctx.route ? { route: String(ctx.route).slice(0, 200) } : {}),
      ...(ctx.requestId ? { requestId: String(ctx.requestId).slice(0, 64) } : {}),
    });
    writeAudit({ entries: entries.slice(0, 500) });
  });
}
