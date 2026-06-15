#!/usr/bin/env node
/**
 * Post-deploy homepage HTML verification for update-server.sh.
 *
 * Compares CSS asset fingerprints on origin (127.0.0.1) vs public edge (SITE_URL).
 * Passes when both match — does not require every file in .next/static/css to appear
 * on the homepage (some chunks are route-specific).
 *
 * Env:
 *   SITE_URL          — public base (default https://minroshmigration.com.au)
 *   ORIGIN_SMOKE_URL  — origin base (default http://127.0.0.1:3000)
 *   ROOT              — app root for .next/static/css listing
 *   VERIFY_RETRIES    — edge retry count after CDN purge (default 5)
 *   VERIFY_RETRY_SECS — seconds between retries (default 4)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.env.ROOT || process.cwd();
const PUBLIC_BASE = (process.env.SITE_URL || "https://minroshmigration.com.au").replace(/\/$/, "");
const ORIGIN_BASE = (process.env.ORIGIN_SMOKE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const RETRIES = Math.max(1, Number(process.env.VERIFY_RETRIES || 5));
const RETRY_SECS = Math.max(1, Number(process.env.VERIFY_RETRY_SECS || 4));

const STALE_LOADER_MARKERS = [
  "loading-screen--route-boundary",
  "<h1>Preparing your migration portal</h1>",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function htmlWithoutInlineScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

/** @param {string} html */
function extractCssLinks(html) {
  const re = /\/_next\/static\/css\/[a-f0-9]+\.css/gi;
  const seen = new Set();
  const links = [];
  for (const m of html.matchAll(re)) {
    const link = m[0].toLowerCase();
    if (!seen.has(link)) {
      seen.add(link);
      links.push(link);
    }
  }
  return links.sort();
}

/** @param {string} html */
function extractScriptChunks(html) {
  const re = /\/_next\/static\/chunks\/[^\s"'<>]+\.js/gi;
  const seen = new Set();
  const links = [];
  for (const m of html.matchAll(re)) {
    const link = m[0].toLowerCase();
    if (!seen.has(link)) {
      seen.add(link);
      links.push(link);
    }
  }
  return links.sort();
}

function listBuildCssFiles() {
  const dir = path.join(ROOT, ".next", "static", "css");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .sort();
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html", "Cache-Control": "no-cache" },
  });
  const body = await res.text();
  return {
    url,
    status: res.status,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries()),
    body,
  };
}

function printDiagnostics({ buildCss, originCss, publicCss, originScripts, publicScripts }) {
  console.log("");
  console.log("--- deploy HTML verification diagnostics ---");
  console.log("Build CSS files (.next/static/css/):");
  if (buildCss.length === 0) {
    console.log("  (none — .next/static/css missing or empty)");
  } else {
    for (const f of buildCss) console.log(`  ${f}`);
  }
  console.log("");
  console.log(`Origin CSS links (${ORIGIN_BASE}/):`);
  if (originCss.length === 0) console.log("  (none)");
  else originCss.forEach((l) => console.log(`  ${l}`));
  console.log("");
  console.log(`Public CSS links (${PUBLIC_BASE}/):`);
  if (publicCss.length === 0) console.log("  (none)");
  else publicCss.forEach((l) => console.log(`  ${l}`));
  console.log("");
  console.log("Origin script chunks (sample, first 5):");
  originScripts.slice(0, 5).forEach((l) => console.log(`  ${l}`));
  if (originScripts.length > 5) console.log(`  … +${originScripts.length - 5} more`);
  console.log("");
  console.log("Public script chunks (sample, first 5):");
  publicScripts.slice(0, 5).forEach((l) => console.log(`  ${l}`));
  if (publicScripts.length > 5) console.log(`  … +${publicScripts.length - 5} more`);
  console.log("--- end diagnostics ---");
  console.log("");
}

function hasStaleLoader(html) {
  const body = htmlWithoutInlineScripts(html);
  return STALE_LOADER_MARKERS.some((m) => body.includes(m));
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function diffSets(a, b) {
  const onlyA = a.filter((x) => !b.includes(x));
  const onlyB = b.filter((x) => !a.includes(x));
  return { onlyA, onlyB };
}

async function main() {
  const cacheBust = `v=${Date.now()}`;
  const buildCss = listBuildCssFiles();

  let originResult = null;
  try {
    originResult = await fetchHtml(`${ORIGIN_BASE}/?${cacheBust}&origin=1`);
  } catch (err) {
    console.warn(`WARN: could not fetch origin ${ORIGIN_BASE}/ — ${err.message}`);
  }

  let publicResult = null;
  let lastPublicCss = [];

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    const bust = `${cacheBust}&csscheck=${attempt}`;
    try {
      publicResult = await fetchHtml(`${PUBLIC_BASE}/?${bust}`);
    } catch (err) {
      console.error(`ERROR: could not fetch public homepage ${PUBLIC_BASE}/ — ${err.message}`);
      process.exit(1);
    }

    if (!publicResult.ok) {
      console.error(`ERROR: public homepage returned HTTP ${publicResult.status}`);
      process.exit(1);
    }

    if (hasStaleLoader(publicResult.body)) {
      console.error("ERROR: public homepage still contains stale loading-overlay markup.");
      process.exit(1);
    }

    const publicCss = extractCssLinks(publicResult.body);
    lastPublicCss = publicCss;

    if (originResult?.ok) {
      const originCss = extractCssLinks(originResult.body);
      if (arraysEqual(originCss, publicCss)) {
        const originScripts = extractScriptChunks(originResult.body);
        const publicScripts = extractScriptChunks(publicResult.body);
        printDiagnostics({ buildCss, originCss, publicCss, originScripts, publicScripts });
        console.log("OK   origin and public homepage CSS links match");
        if (originResult.headers["content-security-policy"]?.includes("unsafe-inline")) {
          console.log("OK   public CSP allows inline scripts (marketing mode)");
        }
        process.exit(0);
      }

      if (attempt < RETRIES) {
        console.log(
          `==> CSS mismatch origin vs public (attempt ${attempt}/${RETRIES}); waiting ${RETRY_SECS}s for CDN…`,
        );
        await sleep(RETRY_SECS * 1000);
        continue;
      }
    } else {
      // Origin unavailable: fall back to “public CSS ⊆ build CSS”
      const buildHashes = new Set(buildCss.map((f) => f.replace(/\.css$/, "")));
      const publicHashes = publicCss.map((l) => l.split("/").pop()?.replace(/\.css$/, "") || "");
      const allInBuild = publicHashes.length > 0 && publicHashes.every((h) => buildHashes.has(h));
      if (allInBuild) {
        printDiagnostics({
          buildCss,
          originCss: [],
          publicCss,
          originScripts: [],
          publicScripts: extractScriptChunks(publicResult.body),
        });
        console.log("OK   public homepage CSS hashes are from current build (origin check skipped)");
        process.exit(0);
      }
      if (attempt < RETRIES) {
        console.log(`==> public CSS not in build yet (attempt ${attempt}/${RETRIES}); waiting…`);
        await sleep(RETRY_SECS * 1000);
        continue;
      }
    }
  }

  const originCss = originResult?.ok ? extractCssLinks(originResult.body) : [];
  const publicCss = lastPublicCss;
  const originScripts = originResult?.ok ? extractScriptChunks(originResult.body) : [];
  const publicScripts = publicResult ? extractScriptChunks(publicResult.body) : [];

  printDiagnostics({ buildCss, originCss, publicCss, originScripts, publicScripts });

  if (originResult?.ok) {
    const { onlyA, onlyB } = diffSets(originCss, publicCss);
    console.error("ERROR: CDN/proxy stale cache — public homepage HTML does not match origin.");
    console.error("");
    if (onlyA.length) {
      console.error("  CSS on origin only (edge is stale):");
      onlyA.forEach((l) => console.error(`    ${l}`));
    }
    if (onlyB.length) {
      console.error("  CSS on public only (unexpected — edge ahead of origin?):");
      onlyB.forEach((l) => console.error(`    ${l}`));
    }
    console.error("");
    console.error("  Fix: npm run purge:cdn  then re-run this check.");
    console.error(`       Origin:  ${ORIGIN_BASE}/?v=$(date +%s)`);
    console.error(`       Public:  ${PUBLIC_BASE}/?v=$(date +%s)`);
    process.exit(1);
  }

  console.error("ERROR: public homepage CSS does not match current build and origin is unreachable.");
  console.error(`       Ensure PM2 is listening on ${ORIGIN_BASE} and .next/static/css is populated.`);
  process.exit(1);
}

main().catch((err) => {
  console.error("verify-deploy-html:", err);
  process.exit(1);
});
