#!/usr/bin/env node
/**
 * Emergency CMS off — unpublishes all pages in website-pages.json (keeps drafts).
 * Run on server: node scripts/website-cms-emergency-off.js
 */
import { websitePagesFile } from "../lib/admin/paths.js";
import { readJsonFile, writeJsonAtomic } from "../lib/contact.js";

const store = readJsonFile(websitePagesFile, { schemaVersion: 1, pages: [] });
const pages = Array.isArray(store.pages) ? store.pages : [];
const next = pages.map((p) => ({
  ...p,
  status: "draft",
  published: { sections: [], publishedAt: null, publishedBy: null },
}));
writeJsonAtomic(websitePagesFile, { schemaVersion: 1, pages: next });
console.log(`CMS emergency off: cleared published content for ${next.length} page(s).`);
console.log("Also set NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false in production env and redeploy.");
