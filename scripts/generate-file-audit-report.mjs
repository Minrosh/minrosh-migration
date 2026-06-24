/**
 * Walk the repo and emit file-level audit CSV + summary MD.
 * Usage: node scripts/generate-file-audit-report.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_CSV = path.join(ROOT, "reports", "file-audit-full.csv");
const OUT_MD = path.join(ROOT, "reports", "file-audit-summary.md");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "test-results",
  "playwright-report",
  ".cursor",
]);

const LEGACY_HOMEPAGE = new Set([
  "components/home-page-content.jsx",
  "components/home/home-tab-server.jsx",
  "components/home/home-hero-bento.jsx",
  "components/home/home-discover-strip.jsx",
  "components/home/pathway-sequence-animated.jsx",
  "components/home/pathway-map-disclosure.jsx",
  "components/home/pathway-map-panel.jsx",
  "components/home/google-reviews-panel.jsx",
  "components/home/future-pacing-lab.jsx",
  "components/home/quiz-wizard-panel.jsx",
  "components/home/service-decision-engine.jsx",
  "components/home/stories-carousel-panel.jsx",
  "components/home/trust-signals-grid.jsx",
  "components/home/client-journey-map.jsx",
  "components/home/trust-proof-strip.jsx",
  "components/home/story-proof-wall.jsx",
  "components/home/brisbane-parallax.jsx",
  "components/home/contact-chat-panel.jsx",
  "components/home/home-our-services-tabs.jsx",
  "components/home/home-eligibility-wizard.jsx",
  "components/home-visa-comparison-flowchart.jsx",
  "components/home-smart-navigator-island.jsx",
  "components/home-deferred-motion-sections.jsx",
  "components/home-deferred-motion-sections-lazy.jsx",
  "components/mid-content-cta.jsx",
]);

const API_NO_IN_REPO_CALLERS = new Set([
  "app/api/news/route.js",
  "app/api/translate/route.js",
  "app/api/payments/checkout/route.js",
  "app/api/payments/webhook/route.js",
  "app/api/portal/profile/route.js",
  "app/api/portal/invoices/route.js",
  "app/api/portal/payment-method/route.js",
]);

const NODEMAILER_DUPES = new Set([
  "lib/nurture-sequences.js",
  "lib/newsletter.js",
  "lib/intelligence/notifications.js",
  "app/api/admin/broadcast/route.js",
]);

const SAFE_DELETE_CANDIDATES = new Set(["data/enquiries-local.json"]);

const ADMIN_SHIMS = /^components\/admin\//;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function classify(relPath) {
  const p = relPath.replace(/\\/g, "/");
  if (p.includes("node_modules/") || p.startsWith(".next/")) return "Build/generated/cache";
  if (p.endsWith(".tsbuildinfo")) return "Build/generated/cache";
  if (p.startsWith("docs/") || (p.endsWith(".md") && !p.startsWith("app/"))) return "Documentation";
  if (p.startsWith("tests/") || p.startsWith("e2e/") || p.startsWith(".github/")) return "Test/CI";
  if (p.startsWith("scripts/") || p === "ecosystem.config.js" || p.startsWith("deploy")) return "Deployment/server";
  if (p.startsWith("app/admin/") || p.startsWith("app/api/admin/") || p.startsWith("features/admin-panel/") || p.startsWith("lib/admin/")) return "Admin workspace core";
  if (p.startsWith("app/api/") && p.endsWith("/route.js")) return "API/backend route";
  if (p === "lib/seo.js" || p === "app/sitemap.js" || p === "app/robots.js" || p === "lib/public-indexable-routes.js") return "SEO/schema";
  if (p.startsWith("data/") || p.startsWith("public/")) return "Data/config";
  if (p.startsWith("app/") && p.endsWith("/page.js") && !p.startsWith("app/admin/")) return "Public website core";
  if (p.startsWith("components/home") || p.startsWith("components/site-")) return "Public website core";
  if (p.startsWith("components/") || p.startsWith("features/public-site/")) return "Shared component";
  if (p.startsWith("lib/") || p === "middleware.js") return "Shared component";
  if (p.startsWith("app/")) return "Public website core";
  return "Shared component";
}

function purpose(relPath, category) {
  const p = relPath.replace(/\\/g, "/");
  if (p.endsWith("/page.js")) return "Next.js page route";
  if (p.endsWith("/route.js")) return "API route handler";
  if (p.endsWith(".seed.json")) return "Seed data for first-run bootstrap";
  if (p.startsWith("components/admin/")) return "Admin UI re-export shim";
  if (LEGACY_HOMEPAGE.has(p)) return "Legacy homepage tab/hash layout (orphaned)";
  if (category === "SEO/schema") return "SEO, sitemap, or indexability";
  if (category === "Deployment/server") return "Build, deploy, or ops script";
  if (category === "Test/CI") return "Automated test or CI workflow";
  if (category === "Documentation") return "Project documentation";
  if (category === "Data/config") return "Content or runtime configuration";
  if (p.startsWith("lib/")) return "Shared domain logic";
  if (p.startsWith("components/")) return "React UI component";
  return "Application source";
}

function recommend(relPath, category, importerCount) {
  const p = relPath.replace(/\\/g, "/");
  if (SKIP_DIRS.has(p.split("/")[0]) || p.startsWith(".next/")) return { action: "KEEP", reason: "Build artifact (gitignored)", risk: "Low", test: "None" };
  if (SAFE_DELETE_CANDIDATES.has(p)) return { action: "SAFE TO DELETE", reason: "Demo data with zero code references", risk: "Low", test: "npm run build" };
  if (LEGACY_HOMEPAGE.has(p)) return { action: "REVIEW", reason: "Orphaned legacy homepage cluster; no live importers", risk: "Medium", test: "npm run build && npm run test:e2e after removal" };
  if (API_NO_IN_REPO_CALLERS.has(p)) return { action: "REVIEW", reason: "API may be called externally (cron, webhook, portal)", risk: "Medium", test: "Confirm external callers before removal" };
  if (NODEMAILER_DUPES.has(p)) return { action: "MERGE", reason: "Duplicate nodemailer transport; consolidate to lib/contact.js", risk: "Low", test: "npm run test:smtp && test:contact" };
  if (ADMIN_SHIMS.test(p)) return { action: "KEEP", reason: "Intentional re-export shim to features/admin-panel", risk: "Low", test: "Admin smoke after import migration" };
  if (p === "components/content-page.js") return { action: "REVIEW", reason: "Contains hardcoded MARN; centralize via site.json", risk: "Medium", test: "Visual check on content pages" };
  if (category === "Build/generated/cache") return { action: "KEEP", reason: "Generated; ensure gitignored", risk: "Low", test: "None" };
  if (category === "Documentation" || category === "Test/CI" || category === "Deployment/server") return { action: "KEEP", reason: "Operational asset", risk: "Low", test: "CI scripts" };
  if (category === "SEO/schema" || category === "Admin workspace core") return { action: "KEEP", reason: "Core platform functionality", risk: "High", test: "verify:ci" };
  if (importerCount === 0 && (p.endsWith(".jsx") || p.endsWith(".js")) && !p.startsWith("app/")) {
    return { action: "REVIEW", reason: "No static importers detected in source scan", risk: "Medium", test: "npm run build before removal" };
  }
  return { action: "KEEP", reason: "Active or routable source", risk: "Low", test: "npm run build" };
}

function buildImportGraph(sourceFiles) {
  const graph = new Map();
  const importRe = /(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const file of sourceFiles) {
    const relPath = rel(file);
    if (!/\.(js|jsx|mjs)$/.test(relPath)) continue;
    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const importers = [];
    let m;
    while ((m = importRe.exec(content)) !== null) {
      const spec = m[1] || m[2];
      if (!spec || spec.startsWith("node:") || (!spec.startsWith(".") && !spec.startsWith("@/"))) continue;
      let resolved = spec;
      if (spec.startsWith("@/")) resolved = spec.slice(2);
      else resolved = path.normalize(path.join(path.dirname(relPath), spec)).split(path.sep).join("/");
      if (!resolved.endsWith(".js") && !resolved.endsWith(".jsx") && !resolved.endsWith(".mjs")) {
        for (const ext of [".js", ".jsx", ".mjs", "/index.js", "/index.jsx"]) {
          const tryPath = resolved + ext;
          if (sourceFiles.some((f) => rel(f) === tryPath)) {
            resolved = tryPath;
            break;
          }
        }
      }
      importers.push(resolved);
    }
    for (const target of importers) {
      if (!graph.has(target)) graph.set(target, new Set());
      graph.get(target).add(relPath);
    }
  }
  return graph;
}

function csvEscape(s) {
  const t = String(s ?? "").replace(/"/g, '""');
  return `"${t}"`;
}

const allFiles = walk(ROOT);
const sourceFiles = allFiles.filter((f) => /\.(js|jsx|mjs|json|css|md|sh|yml)$/.test(f));
const graph = buildImportGraph(allFiles);

const rows = [];
for (const file of allFiles) {
  const relPath = rel(file);
  if (relPath.startsWith("node_modules/") || relPath.startsWith(".next/")) continue;

  const category = classify(relPath);
  const importers = graph.get(relPath) || new Set();
  const usedBy = [...importers].slice(0, 8).join("; ") || (relPath.startsWith("app/") && relPath.endsWith("/page.js") ? "Next.js router" : relPath.endsWith("/route.js") ? "HTTP" : "—");
  const rec = recommend(relPath, category, importers.size);

  rows.push({
    path: relPath,
    purpose: purpose(relPath, category),
    usedBy,
    category,
    action: rec.action,
    reason: rec.reason,
    risk: rec.risk,
    test: rec.test,
  });
}

rows.sort((a, b) => a.path.localeCompare(b.path));

fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true });
const header = "file_path,purpose,used_by,category,recommended_action,reason,risk_level,testing_required";
const csv = [header, ...rows.map((r) => [r.path, r.purpose, r.usedBy, r.category, r.action, r.reason, r.risk, r.test].map(csvEscape).join(","))].join("\n");
fs.writeFileSync(OUT_CSV, csv);

const counts = {};
for (const r of rows) {
  counts[r.action] = (counts[r.action] || 0) + 1;
}
const byCat = {};
for (const r of rows) {
  byCat[r.category] = (byCat[r.category] || 0) + 1;
}

const reviewList = rows.filter((r) => r.action === "REVIEW").map((r) => `- \`${r.path}\` — ${r.reason}`);
const deleteList = rows.filter((r) => r.action === "SAFE TO DELETE").map((r) => `- \`${r.path}\` — ${r.reason}`);
const mergeList = rows.filter((r) => r.action === "MERGE").map((r) => `- \`${r.path}\` — ${r.reason}`);

const md = `# File Audit Summary

Generated: ${new Date().toISOString().slice(0, 10)}

## Totals

- **Files audited:** ${rows.length}
- **Full CSV:** [file-audit-full.csv](./file-audit-full.csv)

## Recommended actions

| Action | Count |
|--------|-------|
${Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}

## Categories

| Category | Count |
|----------|-------|
${Object.entries(byCat)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}

## REVIEW queue (${reviewList.length})

${reviewList.slice(0, 40).join("\n")}${reviewList.length > 40 ? `\n\n… and ${reviewList.length - 40} more in CSV` : ""}

## SAFE TO DELETE candidates (${deleteList.length})

${deleteList.join("\n") || "None flagged in Phase 1"}

## MERGE candidates (${mergeList.length})

${mergeList.join("\n")}

## Notes

- No files were deleted during audit generation.
- API routes in REVIEW may have external callers (cron, webhooks, Stripe).
- Legacy homepage cluster should only be removed after \`npm run verify:ci\` passes.
`;

fs.writeFileSync(OUT_MD, md);
console.log(`Wrote ${rows.length} rows → ${OUT_CSV}`);
console.log(`Summary → ${OUT_MD}`);
