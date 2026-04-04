import fs from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonAtomic } from "./contact";

const newsletterFile =
  process.env.NEWSLETTER_FILE || path.join(process.cwd(), "data-newsletter.json");
const newsletterSeedFile = path.join(process.cwd(), "data", "newsletter.seed.json");

export function ensureNewsletterFile() {
  if (fs.existsSync(newsletterFile)) return;
  let seededEntries = [];
  try {
    seededEntries = JSON.parse(fs.readFileSync(newsletterSeedFile, "utf8"));
  } catch {
    seededEntries = [];
  }
  writeJsonAtomic(newsletterFile, seededEntries);
}

export function readNewsletterFile() {
  ensureNewsletterFile();
  const raw = readJsonFile(newsletterFile, []);
  return Array.isArray(raw) ? raw : [];
}

/**
 * @param {string} email — validated email (lowercase trim)
 */
export function saveNewsletterEntry(email) {
  ensureNewsletterFile();
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { error: "Email is required." };
  }

  const current = readNewsletterFile();
  const exists = current.some((item) => item.email === normalized);
  if (exists) {
    return { ok: true, exists: true };
  }

  const next = [{ email: normalized, createdAt: new Date().toISOString() }, ...current];
  writeJsonAtomic(newsletterFile, next);
  return { ok: true, exists: false };
}
