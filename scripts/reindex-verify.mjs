#!/usr/bin/env node
/**
 * Post-deploy checks for crawl/index signals (sitemap + robots + home).
 * Google deprecated the old ?sitemap= ping URL; use Search Console for manual "Request indexing".
 *
 * Usage:
 *   node scripts/reindex-verify.mjs
 *   SITE_URL=https://staging.example.com node scripts/reindex-verify.mjs
 */
const base = (process.env.SITE_URL || "https://minroshmigration.com.au").replace(/\/$/, "");

const paths = ["/", "/sitemap.xml", "/robots.txt"];

async function head(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { method: "HEAD", redirect: "follow" });
  return { url, status: res.status, ok: res.ok };
}

let failed = false;
for (const p of paths) {
  try {
    const r = await head(p);
    if (!r.ok) {
      console.error(`FAIL ${r.url} → HTTP ${r.status}`);
      failed = true;
    } else {
      console.log(`OK   ${r.url} → HTTP ${r.status}`);
    }
  } catch (e) {
    console.error(`FAIL ${base}${p}`, e?.message || e);
    failed = true;
  }
}

if (failed) {
  console.error("\nReindex verify: one or more checks failed.");
  process.exit(1);
}

console.log(
  "\nNext (manual): Google Search Console — see docs/SEARCH-CONSOLE-REINDEX.md\n  • Sitemaps → https://minroshmigration.com.au/sitemap.xml\n  • URL Inspection → priority URLs → Request indexing"
);
process.exit(0);
