#!/usr/bin/env node
"use strict";

/**
 * Remove development-only files and folders before deployment or artifact publish.
 * Run after build/tests complete — build still needs scripts/ until then.
 *
 * Usage:
 *   node cleanup-dev-files.js
 *   CLEANUP_DRY_RUN=1 node cleanup-dev-files.js
 *   node cleanup-dev-files.js --dry-run
 *
 * Set CLEANUP_KEEP_WORKFLOWS=1 to skip removing .github/workflows/ (e.g. keep CI in artifact).
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname);

/** Paths relative to project root (files and directories). */
const TARGETS = [
  // Development log
  "website/development/DEVELOPMENT_TRACKER.md",

  // Audit / design reports
  "reports/indexability-audit-stage-0.csv",
  "reports/indexability-audit-stage-0.md",
  "reports/stage2-review",

  // Development-only patch files (canonical copy: mobile-fix-unified.diff)
  "patches/README-WINDOWS.md",
  "patches/mobile-fix-unified.diff",

  // Unit / integration tests
  "tests",
  "e2e",
  "test-results",

  // Helper scripts for deployment and audits (safe after build + copy-standalone-assets)
  "scripts",

  // CI workflows — comment out the next line (or set CLEANUP_KEEP_WORKFLOWS=1) to keep them
  ...(process.env.CLEANUP_KEEP_WORKFLOWS === "1" ? [] : [".github/workflows"]),

  // Tooling / config
  ".lighthouserc.json",
  "playwright.config.mjs",
  "vitest.config.mjs",
  ".eslintrc.json",
  ".vscode/settings.json",
];

const dryRun =
  process.argv.includes("--dry-run") ||
  process.env.CLEANUP_DRY_RUN === "1" ||
  process.env.CLEANUP_DRY_RUN === "true";

function safeRemove(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const normalizedRoot = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
  if (!absolutePath.startsWith(normalizedRoot) && absolutePath !== ROOT) {
    throw new Error(`Refusing path outside project root: ${relativePath}`);
  }
  if (!fs.existsSync(absolutePath)) {
    return { relativePath, status: "missing" };
  }
  if (dryRun) {
    return { relativePath, status: "dry-run" };
  }
  fs.rmSync(absolutePath, { recursive: true, force: true });
  return { relativePath, status: "removed" };
}

function main() {
  console.log(
    dryRun
      ? "cleanup-dev-files: dry run (no files deleted)"
      : "cleanup-dev-files: removing development-only paths"
  );

  let acted = 0;
  let missing = 0;

  for (const target of TARGETS) {
    try {
      const result = safeRemove(target);
      if (result.status === "missing") {
        missing += 1;
        continue;
      }
      acted += 1;
      const label = result.status === "dry-run" ? "would remove" : "removed";
      console.log(`  ${label}: ${target}`);
    } catch (error) {
      console.error(`  failed: ${target} — ${error.message}`);
      process.exitCode = 1;
    }
  }

  console.log(
    `cleanup-dev-files: done (${acted} target(s) ${dryRun ? "matched" : "removed"}, ${missing} missing)`
  );
}

main();
