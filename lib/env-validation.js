import fs from "node:fs";
import path from "node:path";
import { hasAdminPasswordConfigured } from "./admin/admin-auth";

/**
 * Parses `.env.example` for uncommented `KEY=value` lines (template / documented keys).
 * Used for documentation and optional drift checks; production hard requirements are enforced separately.
 *
 * @returns {string[]}
 */
export function getEnvExampleDeclaredKeys() {
  const filePath = path.join(process.cwd(), ".env.example");
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const text = fs.readFileSync(filePath, "utf8");
  /** @type {string[]} */
  const keys = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=/.exec(trimmed);
    if (match) keys.push(match[1]);
  }
  return keys;
}

/**
 * Keys from `.env.example` that `app/api/*` and `lib/*` commonly depend on for a healthy production site.
 * (Informational — see assertEnvValidForRuntime for enforced rules.)
 */
export const ENV_EXAMPLE_KEYS_REFERENCED_IN_APP = [
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_SESSION_SECRET",
  "ADMIN_PASSWORD",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "CHAT_PROVIDER",
  "NEXT_PUBLIC_ENABLE_HCAPTCHA",
  "NEXT_PUBLIC_HCAPTCHA_SITE_KEY",
  "REQUIRE_HCAPTCHA_ON_CONTACT",
  "HCAPTCHA_SECRET",
  "MAINTENANCE_MODE",
  "BROCHURE_FILE",
  "ENQUIRIES_FILE",
];

function isNextProductionBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Fail fast in **production runtime** when critical env is missing or unsafe.
 * Skipped during `next build` (secrets often absent on builders), in non-production, and when SKIP_ENV_VALIDATION=1.
 */
export function assertEnvValidForRuntime() {
  if (process.env.SKIP_ENV_VALIDATION === "1") return;
  if (process.env.NODE_ENV !== "production") return;
  if (isNextProductionBuildPhase()) return;

  /** @type {string[]} */
  const failures = [];

  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (!siteUrl) {
    failures.push(
      "NEXT_PUBLIC_SITE_URL is empty. Set it to your public https:// origin (see .env.example). Required for canonical URLs, admin origin checks, and email footers."
    );
  } else {
    try {
      const u = new URL(siteUrl);
      if (u.protocol !== "https:") {
        failures.push("NEXT_PUBLIC_SITE_URL must use https:// in production.");
      }
    } catch {
      failures.push("NEXT_PUBLIC_SITE_URL is not a valid URL.");
    }
  }

  const sessionSecret = String(process.env.ADMIN_SESSION_SECRET || "").trim();
  if (sessionSecret.length < 24) {
    failures.push(
      "ADMIN_SESSION_SECRET must be at least 24 characters (long random value). Edge middleware and admin cookies require it; do not reuse ADMIN_PASSWORD."
    );
  }

  if (!hasAdminPasswordConfigured()) {
    failures.push(
      "Admin credentials are not configured. Set a strong ADMIN_PASSWORD in .env or store a bcrypt hash in data/admin-auth.json. Remove .env.example placeholder values."
    );
  }

  if (failures.length) {
    throw new Error(
      `[env-validation] Production environment checks failed:\n\n${failures.map((line) => `  • ${line}`).join("\n\n")}\n\nFix .env on the server (PM2: merge via ecosystem.config.js). For emergency diagnostics only, set SKIP_ENV_VALIDATION=1.`
    );
  }
}
