/**
 * Single source of truth for public website vs admin panel vs shared code zones.
 * Used by scripts/check-public-admin-sync.mjs and docs/ADMIN_PUBLIC_SEPARATION.md.
 */

/** @typedef {"public" | "admin" | "shared"} ProjectZone */

/**
 * Prefix matchers — a changed file belongs to the first matching zone (shared checked last as fallback).
 * @type {Record<ProjectZone, { label: string, prefixes: string[], globs?: string[] }>}
 */
export const PROJECT_ZONES = {
  admin: {
    label: "Admin panel",
    prefixes: [
      "app/admin/",
      "app/api/admin/",
      "components/admin/",
      "lib/admin/",
      "features/admin-panel/",
    ],
  },
  public: {
    label: "Public website",
    prefixes: [
      "app/about/",
      "app/assessment/",
      "app/book-consultation/",
      "app/contact/",
      "app/destinations/",
      "app/education-consultation/",
      "app/employer-sponsored-visas/",
      "app/faq/",
      "app/global-pathways/",
      "app/immigration-news/",
      "app/maintenance/",
      "app/meet-the-team/",
      "app/newsletter/",
      "app/popular-routes/",
      "app/skilled-migration/",
      "app/student-visa-australia/",
      "app/thank-you/",
      "app/tools/",
      "app/updates/",
      "app/upload/",
      "app/visa-services/",
      "app/visitor-visas/",
      "components/home/",
      "components/immigration-news/",
      "components/site-",
      "components/home-",
      "components/contact-",
      "components/smart-navigator",
      "components/quick-enquiry",
      "components/newsletter",
      "components/exit-intent",
      "components/sticky-mobile",
      "components/push-notification",
      "components/seo/",
      "components/lifestyle/",
      "components/tools/",
      "components/destination-",
      "components/migration-",
      "components/australian-visas",
      "components/popular-routes",
      "components/mid-content",
      "components/hub-",
      "components/glossary-",
      "components/ultra-maximum",
      "components/marketing-",
      "components/ai-concierge",
      "components/google-analytics",
      "components/web-vitals",
      "components/public-site-widgets-gate",
      "components/content-page",
      "components/breadcrumbs",
      "components/tracked-link",
      "components/news-board",
      "components/country-coverage",
      "components/agent-registration",
      "components/structured-data",
      "components/scroll-restorer",
      "components/pwa-register",
      "components/runtime-chunk",
      "features/public-site/",
      "lib/news-store",
      "lib/home-",
      "lib/seo",
      "lib/intelligence/",
      "data/site.json",
      "data/news.json",
      "public/",
    ],
    globs: [
      "app/page.js",
      "app/home.css",
      "app/globals.css",
      "app/loading.js",
      "app/error.js",
      "app/not-found.js",
      "app/robots.js",
      "app/sitemap.js",
      "app/feed.xml/",
    ],
  },
  shared: {
    label: "Shared",
    prefixes: [
      "app/layout.js",
      "app/api/contact/",
      "app/api/chat/",
      "app/api/news/",
      "app/api/newsletter/",
      "app/api/quiz-results/",
      "app/api/ai-funnel/",
      "app/api/cron/",
      "app/api/inngest/",
      "app/api/payments/",
      "app/api/portal/",
      "app/api/stats/",
      "app/api/translate/",
      "app/api/webhooks/",
      "app/api/files/",
      "components/ui/",
      "components/hcaptcha-field",
      "components/public-file-img",
      "features/shared/",
      "lib/api/",
      "lib/contact",
      "lib/config",
      "lib/csp/",
      "lib/env-validation",
      "lib/utils",
      "lib/security/",
      "lib/observability/",
      "lib/deploy-build-id",
      "lib/route-loading-bootstrap-script",
      "middleware.js",
      "next.config.mjs",
      "tailwind.config.js",
      "postcss.config.js",
      "jsconfig.json",
      "package.json",
      "scripts/",
      "tests/",
      "e2e/",
      "docs/",
    ],
  },
};

/**
 * @param {string} filePath
 * @returns {ProjectZone | null}
 */
export function classifyChangedFile(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized) return null;

  for (const zone of /** @type {ProjectZone[]} */ (["admin", "public"])) {
    const { prefixes, globs = [] } = PROJECT_ZONES[zone];
    if (prefixes.some((p) => normalized.startsWith(p) || normalized === p.replace(/\/$/, ""))) {
      return zone;
    }
    if (globs.some((g) => normalized === g || normalized.startsWith(g))) {
      return zone;
    }
  }

  for (const prefix of PROJECT_ZONES.shared.prefixes) {
    if (normalized.startsWith(prefix) || normalized === prefix.replace(/\/$/, "")) {
      return "shared";
    }
  }

  if (normalized.startsWith("app/api/")) return "shared";
  if (normalized.startsWith("app/")) return "public";
  if (normalized.startsWith("components/")) return "public";
  if (normalized.startsWith("lib/")) return "shared";

  return null;
}

/**
 * @param {string[]} files
 * @returns {{ public: string[], admin: string[], shared: string[], unknown: string[] }}
 */
export function summarizeZoneChanges(files) {
  /** @type {Record<ProjectZone, string[]> & { unknown: string[] }} */
  const buckets = { public: [], admin: [], shared: [], unknown: [] };
  for (const file of files) {
    const zone = classifyChangedFile(file);
    if (zone) buckets[zone].push(file);
    else buckets.unknown.push(file);
  }
  return buckets;
}
