#!/usr/bin/env node
/**
 * Classify git changes into public / admin / shared / unknown zones and gate risky builds.
 *
 * Usage:
 *   npm run check:sync
 *   npm run check:sync -- --acknowledge-shared-risk
 *   npm run check:sync -- --acknowledge-unknown-risk
 *   npm run check:sync -- --against-main
 *
 * Env (deployment / CI):
 *   ACKNOWLEDGE_SHARED_RISK=1
 *   ACKNOWLEDGE_UNKNOWN_RISK=1
 *   DEPLOY_SKIP_SYNC_PREBUILD=1  — production deploy after tree reset (same as shared ack)
 */
import { execSync } from "node:child_process";
import { summarizeZoneChanges, PROJECT_ZONES } from "../lib/zone-manifest.mjs";

const args = new Set(process.argv.slice(2));
const againstMain = args.has("--against-main");
const acknowledgeShared =
  args.has("--acknowledge-shared-risk") ||
  process.env.ACKNOWLEDGE_SHARED_RISK === "1" ||
  process.env.DEPLOY_SKIP_SYNC_PREBUILD === "1";
const acknowledgeUnknown =
  args.has("--acknowledge-unknown-risk") || process.env.ACKNOWLEDGE_UNKNOWN_RISK === "1";

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
for (const f of gitLines("git diff --name-only origin/main...HEAD")) changed.add(f);

const buckets = summarizeZoneChanges([...changed]);
const hasPublic = buckets.public.length > 0;
const hasAdmin = buckets.admin.length > 0;
const hasShared = buckets.shared.length > 0;
const hasUnknown = buckets.unknown.length > 0;

function printFiles(label, files) {
  if (!files.length) return;
  console.log(`\n${label} (${files.length}):`);
  for (const f of files.slice(0, 30)) console.log(`  - ${f}`);
  if (files.length > 30) console.log(`  … and ${files.length - 30} more`);
}

console.log("MinRosh public / admin sync check");
console.log("=================================");

if (process.env.DEPLOY_SKIP_SYNC_PREBUILD === "1") {
  console.log("check:sync: DEPLOY_SKIP_SYNC_PREBUILD=1 (production deploy — tree synced to HEAD)");
}
if (process.env.ACKNOWLEDGE_SHARED_RISK === "1") {
  console.log("check:sync: ACKNOWLEDGE_SHARED_RISK=1");
}

if (!hasPublic && !hasAdmin && !hasShared && !hasUnknown) {
  console.log("\nNo zone changes detected (staged, unstaged, or untracked).");
  process.exit(0);
}

if (hasPublic) {
  console.log(
    "\n⚠ Public website files changed. Check homepage, contact, assessment, service pages, country pages, and SEO."
  );
  printFiles(PROJECT_ZONES.public.label, buckets.public);
}

if (hasAdmin) {
  console.log(
    "\n⚠ Admin panel files changed. Check admin login, dashboard, admin APIs, auth, and production login."
  );
  printFiles(PROJECT_ZONES.admin.label, buckets.admin);
}

if (hasShared) {
  console.log("\n⚠ Shared files changed. You must test both public website and admin panel.");
  printFiles(PROJECT_ZONES.shared.label, buckets.shared);
}

if (hasUnknown) {
  console.log("\n⚠ Unknown-zone files changed. Please classify them before deployment.");
  printFiles("Unknown / unclassified", buckets.unknown);
}

console.log("\nRecommended checks:");

if (hasPublic || hasShared) {
  console.log("  Public:");
  console.log("    - npm run lint");
  console.log("    - npm run build");
  console.log("    - test /");
  console.log("    - test /contact");
  console.log("    - test /assessment");
  console.log("    - test one service page (e.g. /skilled-migration)");
  console.log("    - test one country page (e.g. /destinations/australia)");
}

if (hasAdmin || hasShared) {
  console.log("  Admin:");
  console.log("    - npm run lint");
  console.log("    - npm run build");
  console.log("    - test /admin/login");
  console.log("    - test /admin");
  console.log("    - test /api/admin/health");
  console.log("    - test key /api/admin/* routes you touched");
}

if (hasShared) {
  console.log("  Shared:");
  console.log("    - test BOTH public and admin surfaces");
  console.log("    - npm run check:sync -- --acknowledge-shared-risk  (only after both pass)");
}

let exitCode = 0;

if (hasShared && !acknowledgeShared) {
  console.log("\nShared zone changes detected — exiting with code 1.");
  console.log("Re-run with: npm run check:sync -- --acknowledge-shared-risk");
  console.log("Or: ACKNOWLEDGE_SHARED_RISK=1 npm run build");
  exitCode = 1;
}

if (hasUnknown && !acknowledgeUnknown) {
  console.log("\nUnknown-zone changes detected — exiting with code 1.");
  console.log("Re-run with: npm run check:sync -- --acknowledge-unknown-risk");
  console.log("Or add the file to lib/zone-manifest.mjs and classify it properly.");
  if (exitCode === 0) exitCode = 1;
}

if (exitCode === 0) {
  if (acknowledgeShared && hasShared) {
    console.log("\nSync check complete (shared-risk acknowledged).");
  } else {
    console.log("\nSync check complete (warnings only).");
  }
}

process.exit(exitCode);
