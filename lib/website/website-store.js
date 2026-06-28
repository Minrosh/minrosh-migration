import fs from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";

/**
 * Corruption-safe JSON read for website CMS stores.
 * @param {string} filePath
 * @param {string} seedPath
 * @param {(raw: unknown) => { ok: true, data: unknown } | { ok: false, error: string }} validate
 * @param {unknown} emptyFallback
 */
export function readWebsiteStore(filePath, seedPath, validate, emptyFallback) {
  try {
    ensureWebsiteStore(filePath, seedPath, emptyFallback);
    const raw = readJsonFile(filePath, emptyFallback);
    const result = validate(raw);
    if (!result.ok) {
      console.error("[website-cms] invalid store shape:", filePath, result.error);
      return { ok: false, data: null, error: result.error };
    }
    return { ok: true, data: result.data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Read failed";
    console.error("[website-cms] corrupt or unreadable store:", filePath, message);
    return { ok: false, data: null, error: message };
  }
}

export function ensureWebsiteStore(filePath, seedPath, emptyFallback) {
  if (fs.existsSync(filePath)) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(seedPath)) {
    fs.copyFileSync(seedPath, filePath);
    return;
  }
  writeJsonAtomic(filePath, emptyFallback);
}

export function websiteStoreLockPath(filePath) {
  const base = path.basename(filePath, ".json");
  return path.join(path.dirname(filePath), `.${base}-mutation.lock`);
}

/**
 * @template T
 * @param {string} filePath
 * @param {() => T} fn
 */
export function withWebsiteStoreMutation(filePath, fn) {
  return withMutationLock(websiteStoreLockPath(filePath), fn);
}

/**
 * @param {string} filePath
 * @param {unknown} data
 */
export function writeWebsiteStore(filePath, data) {
  writeJsonAtomic(filePath, data);
}
