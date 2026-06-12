#!/usr/bin/env node
/**
 * Stage 0: indexability audit — fetch public URLs, HTML signals, route-file parity, live sitemap diff.
 *
 * Usage:
 *   node scripts/indexability-audit.mjs
 *   INDEXABILITY_BASE_URL=https://minroshmigration.com.au node scripts/indexability-audit.mjs
 *   node scripts/indexability-audit.mjs --gsc-csv=./path/to/export.csv
 *
 * Outputs:
 *   reports/indexability-audit-stage-0.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_BASE = "https://minroshmigration.com.au";
const OUT_MD = path.join(ROOT, "reports/indexability-audit-stage-0.md");
const UA =
  "Mozilla/5.0 (compatible; MinRoshIndexabilityAudit/1.0; +https://minroshmigration.com.au)";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function argvGscCsv() {
  const hit = process.argv.find((a) => a.startsWith("--gsc-csv="));
  return hit ? path.resolve(ROOT, hit.slice("--gsc-csv=".length)) : null;
}

function simpleCsvSplit(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if (!q && c === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

/** @returns {Map<string, string>} pathname -> reason */
function loadGscCsv(filePath) {
  const map = new Map();
  if (!filePath || !fs.existsSync(filePath)) return map;
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return map;
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  let urlIdx = header.findIndex((h) => /^(page|url)$/i.test(h));
  let reasonIdx = header.findIndex((h) => /reason|indexing|coverage|status/i.test(h));
  if (urlIdx < 0) urlIdx = 0;
  if (reasonIdx < 0) reasonIdx = header.length > 1 ? 1 : -1;
  for (let i = 1; i < lines.length; i++) {
    const cols = simpleCsvSplit(lines[i]);
    const urlCell = cols[urlIdx]?.replace(/^"|"$/g, "").trim();
    if (!urlCell) continue;
    let pathname = urlCell;
    try {
      pathname = new URL(urlCell, DEFAULT_BASE).pathname || "/";
    } catch {
      pathname = urlCell.startsWith("/") ? urlCell : `/${urlCell}`;
    }
    const reason =
      reasonIdx >= 0 ? (cols[reasonIdx] || "").replace(/^"|"$/g, "").trim() : "";
    map.set(normalizePath(pathname), reason || "unknown");
  }
  return map;
}

function normalizePath(p) {
  if (!p || p === "/") return "/";
  const s = p.endsWith("/") ? p.slice(0, -1) || "/" : p;
  return s;
}

function verifyAppRoute(routePath, destKeys, sectionIds) {
  const p = routePath === "/" ? "/" : routePath;
  const sectionsSet = new Set(sectionIds);

  if (/^\/immigration-news\/([^/]+)$/.test(p)) {
    const f = path.join(ROOT, "app", "immigration-news", "[slug]", "page.js");
    return { ok: fs.existsSync(f), detail: "app/immigration-news/[slug]/page.js" };
  }

  const destSec = /^\/destinations\/([^/]+)\/([^/]+)$/.exec(p);
  if (destSec) {
    const slug = destSec[1];
    const sec = destSec[2];
    if (!destKeys.includes(slug)) return { ok: false, detail: `unknown destination slug: ${slug}` };
    if (!sectionsSet.has(sec)) return { ok: false, detail: `unknown section: ${sec}` };
    const f = path.join(ROOT, "app", "destinations", "[slug]", "[section]", "page.js");
    return { ok: fs.existsSync(f), detail: "app/destinations/[slug]/[section]/page.js" };
  }

  const dest = /^\/destinations\/([^/]+)$/.exec(p);
  if (dest) {
    const slug = dest[1];
    if (!destKeys.includes(slug)) return { ok: false, detail: `unknown destination slug: ${slug}` };
    const f = path.join(ROOT, "app", "destinations", "[slug]", "page.js");
    return { ok: fs.existsSync(f), detail: "app/destinations/[slug]/page.js" };
  }

  const segs = p === "/" ? [] : p.split("/").filter(Boolean);
  const pageFile =
    segs.length === 0 ? path.join(ROOT, "app", "page.js") : path.join(ROOT, "app", ...segs, "page.js");
  return { ok: fs.existsSync(pageFile), detail: path.relative(ROOT, pageFile) };
}

function escapeMdCell(field) {
  return String(field ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function extractCanonical(html) {
  const m =
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return m ? m[1].trim() : "";
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim().replace(/\s+/g, " ") : "";
}

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i"
  );
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function countH1(html) {
  const matches = html.match(/<h1\b[^>]*>/gi);
  return matches ? matches.length : 0;
}

function detectSoft404(status, title, htmlHead) {
  const hints = [];
  if (status === 404) hints.push("http_404");
  if (/404|not\s+found|page\s+not\s+found/i.test(title)) hints.push("title_not_found");
  if (/NEXT_NOT_FOUND|notFound\(\)/i.test(htmlHead)) hints.push("next_not_found_marker");
  return hints.join(";") || "";
}

function deploymentHints(headers) {
  const pick = ["x-vercel-id", "x-vercel-deployment-url", "x-powered-by", "x-nextjs-cache", "cf-ray"];
  const out = {};
  for (const k of pick) {
    const v = headers.get(k);
    if (v) out[k] = v;
  }
  return out;
}

async function fetchFinal(startUrl) {
  let current = startUrl;
  const chain = [];
  const max = 12;
  let lastHeaders = new Headers();
  for (let i = 0; i < max; i++) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
    lastHeaders = res.headers;
    chain.push({ url: current, status: res.status });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      current = new URL(loc, current).href;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const text = buf.toString("utf8");
    return {
      finalUrl: current,
      status: res.status,
      chain,
      html: text.slice(0, 800_000),
      headers: res.headers,
      deploymentHints: deploymentHints(res.headers),
    };
  }
  throw new Error(`redirect_chain_exceeded:${startUrl}`);
}

function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    try {
      const u = new URL(m[1].trim());
      urls.push(normalizePath(u.pathname || "/"));
    } catch {
      /* skip */
    }
  }
  return urls;
}

function extractStringArrayFromSource(filePath, exportName) {
  const src = fs.readFileSync(filePath, "utf8");
  const re = new RegExp(`export const ${exportName} = \\[([\\s\\S]*?)\\];`, "m");
  const m = src.match(re);
  if (!m) throw new Error(`Could not parse ${exportName} from ${filePath}`);
  const body = m[1]
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/,\s*$/, "");
  return JSON.parse(`[${body}]`);
}

function buildExpectedRoutes(destinationsJson, staticRoutes, sectionIds) {
  const slugs = Object.keys(destinationsJson || {});
  const hubRoutes = slugs.map((slug) => `/destinations/${slug}`);
  const sectionRoutes = slugs.flatMap((slug) =>
    sectionIds.map((section) => `/destinations/${slug}/${section}`)
  );
  return [...staticRoutes, ...hubRoutes, ...sectionRoutes];
}

async function main() {
  const base = (process.env.INDEXABILITY_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
  const gscPath = argvGscCsv();
  const gscMap = gscPath ? loadGscCsv(gscPath) : new Map();

  const staticRoutes = extractStringArrayFromSource(
    path.join(ROOT, "lib/public-indexable-routes.js"),
    "STATIC_SITEMAP_ROUTES"
  );
  const sectionIds = extractStringArrayFromSource(
    path.join(ROOT, "lib/destination-nav.js"),
    "DESTINATION_SECTION_IDS"
  );

  const destinations = readJson(path.join(ROOT, "data/destinations.json"));
  const destKeys = Object.keys(destinations || {});
  const newsList = readJson(path.join(ROOT, "data/news.json"));
  const newsRoutes = (Array.isArray(newsList) ? newsList : [])
    .map((n) => String(n.slug || "").trim())
    .filter(Boolean)
    .map((slug) => `/immigration-news/${slug}`);

  const staticAndDest = buildExpectedRoutes(destinations, staticRoutes, sectionIds);
  const expectedPaths = [...new Set([...staticAndDest, ...newsRoutes])].sort((a, b) =>
    a.localeCompare(b)
  );

  const rows = [];

  let sitemapAnalysis = {
    sitemapUrl: `${base}/sitemap.xml`,
    ok: false,
    status: 0,
    onlyInLive: [],
    onlyInExpected: [],
    locCount: 0,
    error: "",
  };

  try {
    const sm = await fetch(`${base}/sitemap.xml`, { redirect: "follow", headers: { "user-agent": UA } });
    sitemapAnalysis.status = sm.status;
    sitemapAnalysis.ok = sm.ok;
    if (sm.ok) {
      const xml = await sm.text();
      const livePaths = [...new Set(parseSitemapUrls(xml))].sort((a, b) => a.localeCompare(b));
      sitemapAnalysis.locCount = livePaths.length;
      const expSet = new Set(expectedPaths.map(normalizePath));
      const liveSet = new Set(livePaths.map(normalizePath));
      sitemapAnalysis.onlyInLive = [...liveSet].filter((p) => !expSet.has(p)).sort();
      sitemapAnalysis.onlyInExpected = [...expSet].filter((p) => !liveSet.has(p)).sort();
    }
  } catch (e) {
    sitemapAnalysis.error = e?.message || String(e);
  }

  let robotsAnalysis = { url: `${base}/robots.txt`, ok: false, status: 0, snippet: "", error: "" };
  try {
    const rb = await fetch(robotsAnalysis.url, { redirect: "follow", headers: { "user-agent": UA } });
    robotsAnalysis.status = rb.status;
    robotsAnalysis.ok = rb.ok;
    robotsAnalysis.snippet = rb.ok ? (await rb.text()).slice(0, 1500) : "";
  } catch (e) {
    robotsAnalysis.error = e?.message || String(e);
  }

  let rootProbe = { ok: false, status: 0, deploymentHints: {}, error: "" };
  try {
    const r = await fetchFinal(`${base}/`);
    rootProbe = { ok: true, status: r.status, deploymentHints: r.deploymentHints };
  } catch (e) {
    rootProbe.error = e?.message || String(e);
  }

  for (const pathname of expectedPaths) {
    const fullUrl = `${base}${pathname === "/" ? "" : pathname}`;
    const gscReason = gscMap.get(normalizePath(pathname)) || "unknown";
    const routeCheck = verifyAppRoute(pathname, destKeys, sectionIds);

    const row = {
      path: pathname,
      fullUrl,
      gscReason,
      routeFileOk: routeCheck.ok ? "yes" : "no",
      routeDetail: routeCheck.detail,
      finalUrl: "",
      statusCode: "",
      redirected: "",
      canonicalHref: "",
      canonicalMatchesFinal: "",
      metaRobots: "",
      hasNoindex: "",
      title: "",
      metaDescription: "",
      h1Count: "",
      htmlBytes: "",
      soft404Signals: "",
      errorSnippet: "",
      fetchError: "",
      deployHintsJson: "",
    };

    try {
      const r = await fetchFinal(fullUrl);
      row.finalUrl = r.finalUrl;
      row.statusCode = String(r.status);
      row.redirected = r.finalUrl !== fullUrl ? "yes" : "no";
      row.htmlBytes = String(Buffer.byteLength(r.html, "utf8"));
      row.deployHintsJson = JSON.stringify(r.deploymentHints || {});

      const canon = extractCanonical(r.html);
      row.canonicalHref = canon;
      try {
        const finalPath = normalizePath(new URL(r.finalUrl).pathname || "/");
        const canonPath = canon ? normalizePath(new URL(canon, base).pathname || "/") : "";
        row.canonicalMatchesFinal =
          canon && canonPath === finalPath ? "yes" : canon ? "no" : "missing";
      } catch {
        row.canonicalMatchesFinal = canon ? "no" : "missing";
      }

      row.metaRobots =
        extractMeta(r.html, "robots") || r.headers.get("x-robots-tag") || "";
      row.hasNoindex = /noindex/i.test(row.metaRobots) ? "yes" : "no";

      row.title = extractTitle(r.html);
      row.metaDescription = extractMeta(r.html, "description");
      row.h1Count = String(countH1(r.html));

      row.soft404Signals = detectSoft404(r.status, row.title, r.html.slice(0, 8000));
      if (/application\s+error|server\s+error|500/i.test(r.html.slice(0, 3000)))
        row.errorSnippet = "possible_runtime_error_marker";
    } catch (e) {
      row.fetchError = e?.message || String(e);
    }

    rows.push(row);
  }

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });

  const bad = rows.filter(
    (r) =>
      r.routeFileOk !== "yes" ||
      r.fetchError ||
      Number(r.statusCode) >= 400 ||
      r.canonicalMatchesFinal === "no" ||
      r.canonicalMatchesFinal === "missing" ||
      r.hasNoindex === "yes" ||
      Number(r.h1Count) === 0 ||
      r.soft404Signals
  );

  const md = buildMarkdown(
    rows,
    bad,
    sitemapAnalysis,
    robotsAnalysis,
    rootProbe,
    expectedPaths.length,
    gscPath
  );
  fs.writeFileSync(OUT_MD, md, "utf8");

  console.log(`Wrote ${OUT_MD}`);

  if (bad.length) console.error(`\n${bad.length} URLs need attention (see Markdown report).`);

  let code = 0;
  if (!sitemapAnalysis.ok || sitemapAnalysis.error) {
    console.error("\nSitemap fetch/parse issue — see Markdown report.");
    code = Math.max(code, 2);
  } else if (sitemapAnalysis.onlyInExpected.length || sitemapAnalysis.onlyInLive.length) {
    console.error("\nSitemap parity mismatch — see Markdown report.");
    code = Math.max(code, 2);
  }
  if (bad.length) code = Math.max(code, 1);
  process.exitCode = code;
}

function buildMarkdown(rows, badRows, sitemapAnalysis, robotsAnalysis, rootProbe, expectedCount, gscPath) {
  const lines = [];
  lines.push("# Stage 0 — Indexability audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`URLs audited: ${expectedCount}`);
  if (gscPath) lines.push(`GSC CSV merged: ${gscPath}`);
  lines.push("");
  lines.push("## Root cause hypotheses (automated heuristics)");
  lines.push("");
  const httpBad = rows.filter((r) => r.fetchError || Number(r.statusCode) >= 400);
  const canonBad = rows.filter((r) => r.canonicalMatchesFinal === "no" || r.canonicalMatchesFinal === "missing");
  const noindexHits = rows.filter((r) => r.hasNoindex === "yes");
  const routeBad = rows.filter((r) => r.routeFileOk !== "yes");
  const h1Bad = rows.filter((r) => Number(r.h1Count) === 0 && !r.fetchError);
  const soft = rows.filter((r) => r.soft404Signals);

  if (httpBad.length)
    lines.push(`- **HTTP errors / fetch failures:** ${httpBad.length} (see \`fetchError\`, \`statusCode\`).`);
  if (canonBad.length)
    lines.push(`- **Canonical mismatch or missing:** ${canonBad.length} (see table below).`);
  if (noindexHits.length)
    lines.push(`- **noindex:** ${noindexHits.length} URLs — confirm intentional before changing code.`);
  if (routeBad.length)
    lines.push(`- **Route file vs sitemap:** ${routeBad.length} paths flagged (see \`routeDetail\`).`);
  if (h1Bad.length) lines.push(`- **Zero H1:** ${h1Bad.length} URLs.`);
  if (soft.length) lines.push(`- **Soft 404 hints:** ${soft.length} URLs.`);

  if (
    !httpBad.length &&
    !canonBad.length &&
    !noindexHits.length &&
    !routeBad.length &&
    !h1Bad.length &&
    !soft.length
  ) {
    lines.push("- No blocking issues from heuristics — still merge **Search Console** export for `gscReason`.");
  }

  lines.push("");
  lines.push("## Live vs repo / deployment");
  lines.push("");
  lines.push(
    "- Re-run with `INDEXABILITY_BASE_URL=http://127.0.0.1:3000` after `npm run build && npm run start` to compare prod vs local."
  );
  lines.push(`- Homepage probe: ok=${rootProbe.ok} status=${rootProbe.status}`);
  if (rootProbe.error) lines.push(`- Homepage error: ${rootProbe.error}`);
  lines.push(`- Response hints: \`${JSON.stringify(rootProbe.deploymentHints || {})}\``);
  lines.push("- **Deployed git SHA:** not in HTTP by default — check hosting/CI.");

  lines.push("");
  lines.push("## robots.txt");
  lines.push("");
  lines.push(`- ${robotsAnalysis.url} → HTTP ${robotsAnalysis.status} ok=${robotsAnalysis.ok}`);
  if (robotsAnalysis.error) lines.push(`- Error: ${robotsAnalysis.error}`);
  else lines.push(`\n\`\`\`\n${robotsAnalysis.snippet.slice(0, 1200)}\n\`\`\``);

  lines.push("");
  lines.push("## sitemap.xml parity");
  lines.push("");
  lines.push(`- ${sitemapAnalysis.sitemapUrl} → HTTP ${sitemapAnalysis.status} ok=${sitemapAnalysis.ok}`);
  lines.push(`- \`<loc>\` count: ${sitemapAnalysis.locCount}`);
  if (sitemapAnalysis.error) lines.push(`- Error: ${sitemapAnalysis.error}`);
  if (sitemapAnalysis.onlyInExpected.length) {
    lines.push(`- **Expected but missing in live sitemap:** ${sitemapAnalysis.onlyInExpected.length}`);
    sitemapAnalysis.onlyInExpected.slice(0, 30).forEach((p) => lines.push(`  - ${p}`));
  }
  if (sitemapAnalysis.onlyInLive.length) {
    lines.push(`- **In live sitemap but not in repo build list:** ${sitemapAnalysis.onlyInLive.length}`);
    sitemapAnalysis.onlyInLive.slice(0, 30).forEach((p) => lines.push(`  - ${p}`));
  }

  lines.push("");
  lines.push("## URLs needing attention");
  lines.push("");
  if (!badRows.length) {
    lines.push("- None flagged by heuristics.");
  } else {
    lines.push(
      "| path | status | route | canonical | noindex | h1 | notes |",
      "| --- | --- | --- | --- | --- | --- | --- |"
    );
    for (const r of badRows.slice(0, 100)) {
      const notes = [r.fetchError, r.soft404Signals, r.routeDetail].filter(Boolean).join("; ");
      lines.push(
        `| ${escapeMdCell(r.path)} | ${escapeMdCell(r.statusCode)} | ${escapeMdCell(r.routeFileOk)} | ${escapeMdCell(r.canonicalMatchesFinal)} | ${escapeMdCell(r.hasNoindex)} | ${escapeMdCell(r.h1Count)} | ${escapeMdCell(notes)} |`
      );
    }
    if (badRows.length > 100) {
      lines.push("");
      lines.push(`_Showing first 100 of ${badRows.length} flagged URLs._`);
    }
  }

  lines.push("");
  lines.push("## Thin / duplicate destination sections (manual policy)");
  lines.push("");
  lines.push(
    "- Review `/destinations/{slug}/about|contact|faq` in the table above; do **not** add `noindex` without stakeholder business reason (see roadmap guardrails)."
  );

  lines.push("");
  lines.push("## noindex / canonical recommendations");
  lines.push("");
  lines.push("- See the attention table above; no automatic code changes from this report alone.");

  lines.push("");
  lines.push("## Stage 0 scope");
  lines.push("");
  lines.push("- No homepage redesign in this audit artifact.");

  return lines.join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
