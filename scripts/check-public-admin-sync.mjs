#!/usr/bin/env node
/**
 * Warn when git changes touch public website, admin panel, or shared zones.
 *
 * Usage:
 *   npm run check:sync
 *   npm run check:sync -- --acknowledge-shared-risk
 *   npm run check:sync -- --against-main
 */
import { execSync } from "node:child_process";
import { summarizeZoneChanges, PROJECT_ZONES } from "../lib/zone-manifest.mjs";

const args = new Set(process.argv.slice(2));
const acknowledgeShared =
  args.has("--acknowledge-shared-risk") || process.env.DEPLOY_SKIP_SYNC_PREBUILD === "1";
const againstMain = args.has("--against-main");

if (process.env.DEPLOY_SKIP_SYNC_PREBUILD === "1") {
  console.log("check:sync: DEPLOY_SKIP_SYNC_PREBUILD=1 (production deploy — tree synced to HEAD)");
}

function gitLines(command) {
  try {
    return execSync(command, { encoding: "utf8" })
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** @type {Set<string>} */
const changed = new Set([
  ...gitLines("git diff --name-only"),
  ...gitLines("git diff --cached --name-only"),
  ...gitLines("git ls-files --others --exclude-standard"),
]);

if (againstMain) {
  for (const f of gitLines("git diff --name-only main...HEAD")) changed.add(f);
}

const buckets = summarizeZoneChanges([...changed]);
const hasPublic = buckets.public.length > 0;
const hasAdmin = buckets.admin.length > 0;
const hasShared = buckets.shared.length > 0;

function printFiles(label, files) {
  if (!files.length) return;
  console.log(`\n${label} (${files.length}):`);
  for (const f of files.slice(0, 30)) console.log(`  - ${f}`);
  if (files.length > 30) console.log(`  … and ${files.length - 30} more`);
}

console.log("MinRosh public / admin sync check");
console.log("=================================");

if (!hasPublic && !hasAdmin && !hasShared) {
  console.log("\nNo tracked zone changes detected (staged, unstaged, or untracked).");
  process.exit(0);
}

if (hasPublic) {
  console.log(
    "\n⚠ Public website files changed. Please check whether admin panel depends on shared routes, components, APIs, styles, auth, or types."
  );
  printFiles(PROJECT_ZONES.public.label, buckets.public);
}

if (hasAdmin) {
  console.log(
    "\n⚠ Admin panel files changed. Please check whether public website depends on shared routes, APIs, types, styles, or layout."
  );
  printFiles(PROJECT_ZONES.admin.label, buckets.admin);
}

if (hasShared) {
  console.log("\n⚠ Shared files changed. You must test both public website and admin panel.");
  printFiles(PROJECT_ZONES.shared.label, buckets.shared);
}

console.log("\nRecommended checks:");
console.log("  - npm run lint");
if (hasShared || hasPublic || hasAdmin) console.log("  - npm run build");
console.log("  - Manual: public homepage loads (/)");
console.log("  - Manual: contact page (/contact)");
console.log("  - Manual: Smart Navigator (/assessment) if you changed funnel code");
console.log("  - Manual: admin login (/admin/login)");
console.log("  - Manual: admin dashboard (/admin) — loading must finish or show a clear error");

if (hasShared && !acknowledgeShared) {
  console.log("\nShared zone changes detected — exiting with code 1.");
  console.log("Re-run with: npm run check:sync -- --acknowledge-shared-risk");
  process.exit(1);
}

console.log("\nSync check complete (warnings only).");
process.exit(0);
