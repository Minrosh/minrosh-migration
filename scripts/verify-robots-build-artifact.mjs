#!/usr/bin/env node
/**
 * After `next build`, verify baked robots.txt.body matches the intended site env.
 * Run automatically for production release builds; optional otherwise.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bodyPath = path.join(root, ".next/server/app/robots.txt.body");
const siteEnv = String(process.env.SITE_ENVIRONMENT || "").trim().toLowerCase();
const releaseTarget = String(process.env.RELEASE_TARGET || "").trim().toLowerCase();
const expectProduction =
  releaseTarget === "production" ||
  siteEnv === "production" ||
  process.env.REQUIRE_PRODUCTION_BUILD_ENV === "1" ||
  process.argv.includes("--production");
const expectStaging = siteEnv === "staging" || process.argv.includes("--staging");

if (!fs.existsSync(bodyPath)) {
  console.warn(`verify-robots-build-artifact: missing ${bodyPath} (skip)`);
  process.exit(0);
}

const body = fs.readFileSync(bodyPath, "utf8");
const disallowAllOnly =
  /User-Agent:\s*\*\s*\nDisallow:\s*\/\s*$/im.test(body.trim()) ||
  (body.includes("Disallow: /") && !body.includes("Allow: /") && !body.includes("Sitemap:"));

if (expectStaging) {
  if (!disallowAllOnly && !/Disallow:\s*\/\s*$/m.test(body)) {
    console.error("ERROR: staging build expected robots Disallow: / ; got:\n", body.slice(0, 400));
    process.exit(1);
  }
  console.log("verify-robots-build-artifact: OK (staging disallow-all present)");
  process.exit(0);
}

if (expectProduction) {
  if (disallowAllOnly) {
    console.error(
      "ERROR: production release robots.txt.body looks like staging lockdown (Disallow: / only).\n" +
        "  Likely SITE_ENVIRONMENT=staging leaked into the build shell.\n" +
        "  Rebuild with SITE_ENVIRONMENT=production (see docs/ops/ROBOTS-BUILD-AND-RUNTIME.md).",
    );
    process.exit(1);
  }
  if (!body.includes("Sitemap:") || !body.includes("Allow: /")) {
    console.error("ERROR: production robots.txt.body missing Allow:/ or Sitemap:\n", body.slice(0, 400));
    process.exit(1);
  }
  console.log("verify-robots-build-artifact: OK (production indexing rules)");
  process.exit(0);
}

console.log("verify-robots-build-artifact: skipped (no production/staging expectation set)");
