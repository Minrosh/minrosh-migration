import path from "node:path";
import { randomUUID } from "node:crypto";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";

export const NEWS_PUBLIC_BASE = "/immigration-news";

const newsFile = path.join(process.cwd(), "data", "news.json");

function newsLockPath() {
  return path.join(path.dirname(newsFile), ".news-mutation.lock");
}

export function readNewsList() {
  const list = readJsonFile(newsFile, []);
  return Array.isArray(list) ? list : [];
}

export function writeNewsList(entries) {
  writeJsonAtomic(newsFile, Array.isArray(entries) ? entries : []);
}

/** Serialize all mutations that read/write `data/news.json`. Returns `fn()` result. */
export function withNewsMutation(fn) {
  return withMutationLock(newsLockPath(), () => fn());
}

export function slugifyTitle(title, max = 80) {
  const s = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return s || "news-item";
}

export function makeUniqueNewsSlug(baseTitle, existingSlugs) {
  const set = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs);
  const base = slugifyTitle(baseTitle) || `item-${Date.now()}`;
  if (!set.has(base)) return base;
  return `${base}-${randomUUID().slice(0, 8)}`;
}

export function newNewsItemId() {
  return `news-${randomUUID()}`;
}
