import { randomUUID } from "node:crypto";
import path from "node:path";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readCrmTasks, writeCrmTasks } from "@/lib/admin/crm-store";
import { crmTasksFile } from "@/lib/admin/paths";

function lockPath() {
  return path.join(path.dirname(crmTasksFile), ".crm-tasks.lock");
}

export function listTasks({ customerId, openOnly } = {}) {
  const { tasks } = readCrmTasks();
  let list = Array.isArray(tasks) ? [...tasks] : [];
  if (customerId) list = list.filter((t) => t.customerId === customerId);
  if (openOnly) list = list.filter((t) => t.status !== "done");
  return list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createTask({ title, customerId, opportunityId, dueAt, source }) {
  const at = new Date().toISOString();
  const row = {
    id: `task-${randomUUID()}`,
    createdAt: at,
    title: String(title || "Task").slice(0, 300),
    customerId: String(customerId || "").trim() || undefined,
    opportunityId: String(opportunityId || "").trim() || undefined,
    dueAt: dueAt || undefined,
    status: "open",
    source: String(source || "manual").slice(0, 80),
  };
  withMutationLock(lockPath(), () => {
    const { tasks } = readCrmTasks();
    const list = Array.isArray(tasks) ? tasks : [];
    list.unshift(row);
    writeCrmTasks({ tasks: list.slice(0, 8000) });
  });
  return row;
}

export function completeTask(id) {
  return withMutationLock(lockPath(), () => {
    const { tasks } = readCrmTasks();
    const list = Array.isArray(tasks) ? tasks : [];
    const i = list.findIndex((t) => t.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], status: "done", completedAt: new Date().toISOString() };
    writeCrmTasks({ tasks });
    return list[i];
  });
}
