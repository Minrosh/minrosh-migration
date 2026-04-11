import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { intelligencePublishHistoryFile } from "@/lib/admin/paths";

function ensureStore() {
  if (fs.existsSync(intelligencePublishHistoryFile)) return;
  fs.mkdirSync(path.dirname(intelligencePublishHistoryFile), { recursive: true });
  writeJsonAtomic(intelligencePublishHistoryFile, { entries: [] });
}

function lockPath() {
  return path.join(path.dirname(intelligencePublishHistoryFile), ".intelligence-publish-history.lock");
}

export function readPublishHistory() {
  ensureStore();
  return readJsonFile(intelligencePublishHistoryFile, { entries: [] });
}

export function appendPublishHistory(entry) {
  return withMutationLock(lockPath(), () => {
    const store = readPublishHistory();
    const entries = Array.isArray(store.entries) ? store.entries : [];
    const row = {
      id: entry.id || `publish-history-${randomUUID()}`,
      createdAt: new Date().toISOString(),
      status: "published",
      ...entry,
    };
    entries.unshift(row);
    writeJsonAtomic(intelligencePublishHistoryFile, { entries: entries.slice(0, 3000) });
    return row;
  });
}

export function markPublishHistoryRolledBack(id, rollbackMeta = {}) {
  return withMutationLock(lockPath(), () => {
    const store = readPublishHistory();
    const entries = Array.isArray(store.entries) ? store.entries : [];
    const idx = entries.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    const next = {
      ...entries[idx],
      status: "rolled_back",
      rolledBackAt: new Date().toISOString(),
      rollbackMeta,
    };
    entries[idx] = next;
    writeJsonAtomic(intelligencePublishHistoryFile, { entries });
    return next;
  });
}
