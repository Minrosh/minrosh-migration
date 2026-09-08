#!/usr/bin/env node
/**
 * Guard for isolated production release builds.
 *
 * Next may bake `app/robots.js` (and some metadata) using process.env at build
 * time. A shell that still exports SITE_ENVIRONMENT=staging (common after
 * staging work) will emit staging Disallow:/ into the release artefact even
 * when the runtime PM2 env later sets production.
 *
 * Usage (production release builds):
 *   SITE_ENVIRONMENT=production node scripts/assert-release-build-env.mjs
 *   # or: RELEASE_TARGET=production node scripts/assert-release-build-env.mjs
 *
 * Staging builds may set SITE_ENVIRONMENT=staging intentionally.
 */
const siteEnv = String(process.env.SITE_ENVIRONMENT || "").trim().toLowerCase();
const releaseTarget = String(process.env.RELEASE_TARGET || "").trim().toLowerCase();
const requireProduction =
  releaseTarget === "production" ||
  process.env.REQUIRE_PRODUCTION_BUILD_ENV === "1" ||
  process.argv.includes("--production");

console.log(
  `assert-release-build-env: SITE_ENVIRONMENT=${siteEnv || "<unset>"} RELEASE_TARGET=${releaseTarget || "<unset>"}`,
);

if (!requireProduction) {
  if (siteEnv === "staging") {
    console.warn(
      "assert-release-build-env: SITE_ENVIRONMENT=staging — OK for staging builds only.\n" +
        "  For production releases use: env -u SITE_ENVIRONMENT SITE_ENVIRONMENT=production RELEASE_TARGET=production npm run build",
    );
  }
  console.log(
    "assert-release-build-env: soft check only (set RELEASE_TARGET=production or pass --production to enforce)",
  );
  process.exit(0);
}

if (siteEnv === "staging") {
  console.error(
    "ERROR: SITE_ENVIRONMENT=staging while building a production release.\n" +
      "  This bakes staging robots.txt (Disallow: /) and can bake noindex metadata.\n" +
      "  Fix: env -u SITE_ENVIRONMENT SITE_ENVIRONMENT=production npm run build\n" +
      "  (or unset SITE_ENVIRONMENT from the shell before building).",
  );
  process.exit(1);
}

if (siteEnv && siteEnv !== "production") {
  console.error(
    `ERROR: SITE_ENVIRONMENT=${siteEnv} is not allowed for production releases. Use "production".`,
  );
  process.exit(1);
}

if (!siteEnv) {
  console.warn(
    "WARN: SITE_ENVIRONMENT unset during production release build; defaulting checks assume production.\n" +
      "  Prefer: SITE_ENVIRONMENT=production npm run build",
  );
}

console.log("assert-release-build-env: OK (production release build environment)");
