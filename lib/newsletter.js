import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

function migrateNewsletterRows(list) {
  let changed = false;
  const out = list.map((item) => {
    if (!item || typeof item !== "object") return item;
    const next = { ...item };
    if (!next.unsubscribeToken) {
      next.unsubscribeToken = randomUUID();
      changed = true;
    }
    if (!next.status) {
      next.status = "active";
      changed = true;
    }
    if (next.marketingConsent === undefined && next.status === "active") {
      next.marketingConsent = true;
      next.consentRecordedAt = next.consentRecordedAt || next.createdAt || new Date().toISOString();
      changed = true;
    }
    return next;
  });
  return { out, changed };
}

export function readNewsletterFile() {
  ensureNewsletterFile();
  const raw = readJsonFile(newsletterFile, []);
  const list = Array.isArray(raw) ? raw : [];
  const { out, changed } = migrateNewsletterRows(list);
  if (changed) {
    writeJsonAtomic(newsletterFile, out);
  }
  return out;
}

/**
 * Emails that must not receive marketing-style broadcast (newsletter unsubscribed).
 */
export function isMarketingSuppressedEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return true;
  const list = readNewsletterFile();
  return list.some((item) => item.email === e && item.status === "unsubscribed");
}

/**
 * @param {string} token
 */
export function unsubscribeNewsletterByToken(token) {
  ensureNewsletterFile();
  const t = String(token || "").trim();
  if (!t || t.length > 80) {
    return { ok: false, error: "Invalid token." };
  }
  const list = readNewsletterFile();
  const i = list.findIndex((x) => x && x.unsubscribeToken === t);
  if (i === -1) {
    return { ok: false, error: "Unknown or expired link." };
  }
  const row = list[i];
  if (row.status === "unsubscribed") {
    return { ok: true, already: true };
  }
  const next = [...list];
  next[i] = {
    ...row,
    status: "unsubscribed",
    unsubscribedAt: new Date().toISOString(),
  };
  writeJsonAtomic(newsletterFile, next);
  return { ok: true, already: false };
}

/**
 * @param {string} email — validated email (lowercase trim)
 * @param {{ marketingConsent?: boolean }} opts
 */
export function saveNewsletterEntry(email, opts = {}) {
  ensureNewsletterFile();
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { error: "Email is required." };
  }
  if (opts.marketingConsent !== true) {
    return { error: "Marketing consent is required to subscribe." };
  }

  const current = readNewsletterFile();
  const i = current.findIndex((item) => item.email === normalized);
  const now = new Date().toISOString();

  if (i >= 0) {
    const row = current[i];
    if (row.status === "unsubscribed") {
      const next = [...current];
      next[i] = {
        ...row,
        status: "active",
        marketingConsent: true,
        consentRecordedAt: now,
        resubscribedAt: now,
        unsubscribeToken: row.unsubscribeToken || randomUUID(),
      };
      writeJsonAtomic(newsletterFile, next);
      return { ok: true, exists: false, resubscribed: true };
    }
    return { ok: true, exists: true };
  }

  const entry = {
    email: normalized,
    createdAt: now,
    marketingConsent: true,
    consentRecordedAt: now,
    unsubscribeToken: randomUUID(),
    status: "active",
  };
  const next = [entry, ...current];
  writeJsonAtomic(newsletterFile, next);
  return { ok: true, exists: false };
}
