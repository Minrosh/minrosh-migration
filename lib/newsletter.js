import fs from "node:fs";
import path from "node:path";

const newsletterFile =
  process.env.NEWSLETTER_FILE || path.join(process.cwd(), "data-newsletter.json");
const newsletterSeedFile = path.join(process.cwd(), "data", "newsletter.seed.json");

export function ensureNewsletterFile() {
  if (!fs.existsSync(newsletterFile)) {
    let seededEntries = [];
    try {
      seededEntries = JSON.parse(fs.readFileSync(newsletterSeedFile, "utf8"));
    } catch {}
    fs.writeFileSync(newsletterFile, JSON.stringify(seededEntries, null, 2) + "\n", "utf8");
  }
}

export function readNewsletterFile() {
  ensureNewsletterFile();
  try {
    return JSON.parse(fs.readFileSync(newsletterFile, "utf8"));
  } catch {
    return [];
  }
}

export function saveNewsletterEntry(email) {
  ensureNewsletterFile();
  const current = readNewsletterFile();
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { error: "Email is required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { error: "Please enter a valid email address." };
  }

  const exists = current.some((item) => item.email === normalized);
  if (exists) {
    return { ok: true, exists: true };
  }

  const next = [{ email: normalized, createdAt: new Date().toISOString() }, ...current];
  fs.writeFileSync(newsletterFile, JSON.stringify(next, null, 2) + "\n", "utf8");
  return { ok: true, exists: false };
}
