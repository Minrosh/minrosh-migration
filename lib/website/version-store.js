import { randomUUID } from "node:crypto";
import {
  getWebsiteVersionsFile,
  getWebsiteVersionsSeed,
} from "@/lib/website/cms-data-paths";
import {
  readWebsiteStore,
  withWebsiteStoreMutation,
  writeWebsiteStore,
} from "@/lib/website/website-store";

const EMPTY = { schemaVersion: 1, entries: [] };
const MAX_ENTRIES = 500;

function validateVersionStore(raw) {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid store" };
  if (Number(raw.schemaVersion) !== 1) return { ok: false, error: "Unsupported schemaVersion" };
  const entries = Array.isArray(raw.entries) ? raw.entries : [];
  return { ok: true, data: { schemaVersion: 1, entries } };
}

function readStoreInternal() {
  return readWebsiteStore(getWebsiteVersionsFile(), getWebsiteVersionsSeed(), validateVersionStore, EMPTY);
}

/**
 * @param {string} pageSlug
 * @param {object} snapshot — full page document at publish time
 * @param {{ publishedBy?: string }} meta
 */
export function appendWebsiteVersion(pageSlug, snapshot, meta = {}) {
  return withWebsiteStoreMutation(getWebsiteVersionsFile(), () => {
    const result = readStoreInternal();
    const store = result.ok && result.data ? result.data : EMPTY;
    const entry = {
      id: `website-ver-${randomUUID()}`,
      pageSlug: String(pageSlug),
      createdAt: new Date().toISOString(),
      publishedBy: meta.publishedBy || null,
      status: "published",
      snapshot,
    };
    const entries = [entry, ...(Array.isArray(store.entries) ? store.entries : [])].slice(0, MAX_ENTRIES);
    writeWebsiteStore(getWebsiteVersionsFile(), { schemaVersion: 1, entries });
    return entry;
  });
}

/**
 * @param {string} pageSlug
 */
export function listWebsiteVersions(pageSlug) {
  const result = readStoreInternal();
  if (!result.ok || !result.data) return [];
  return result.data.entries.filter((e) => String(e.pageSlug) === String(pageSlug));
}

/**
 * @param {string} versionId
 */
export function getWebsiteVersionById(versionId) {
  const result = readStoreInternal();
  if (!result.ok || !result.data) return null;
  return result.data.entries.find((e) => e.id === versionId) || null;
}

/**
 * @param {string} versionId
 * @param {{ rolledBackBy?: string }} meta
 */
export function markWebsiteVersionRolledBack(versionId, meta = {}) {
  return withWebsiteStoreMutation(getWebsiteVersionsFile(), () => {
    const result = readStoreInternal();
    if (!result.ok || !result.data) return null;
    const entries = [...result.data.entries];
    const idx = entries.findIndex((e) => e.id === versionId);
    if (idx < 0) return null;
    entries[idx] = {
      ...entries[idx],
      status: "rolled_back",
      rolledBackAt: new Date().toISOString(),
      rolledBackBy: meta.rolledBackBy || null,
    };
    writeWebsiteStore(getWebsiteVersionsFile(), { schemaVersion: 1, entries });
    return entries[idx];
  });
}
