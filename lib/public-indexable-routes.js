/**
 * Single source of truth for indexable public URLs: sitemap generation and primary internal links.
 * When adding a new marketing page, update STATIC_SITEMAP_ROUTES, SITEMAP_PRIORITIES, and nav arrays here.
 */

import { DESTINATION_SECTION_IDS } from "./destination-nav";

/** Static public routes (excludes destination hubs/sections — those are derived from data). */
export const STATIC_SITEMAP_ROUTES = [
  "/",
  "/skilled-migration",
  "/migration-sri-lanka-to-australia",
  "/partner-visa-australia",
  "/student-visa-australia",
  "/employer-sponsored-visas",
  "/visitor-visas",
  "/book-consultation",
  "/assessment",
  "/contact",
  "/education-consultation",
  "/about",
  "/faq",
  "/updates",
  "/privacy-policy",
  "/disclaimer",
  "/complaints",
  "/terms-of-use",
  "/code-of-conduct",
  "/partner-visa-australia-guide",
  "/student-visa-australia-requirements",
  "/skilled-migration-australia-points-guide",
  "/australia-visa-fees-and-costs-guide",
  "/australia-visa-processing-times-guide",
  "/australia-visa-document-checklist-guide",
  "/australia-vs-canada-migration-guide",
];

export const SITEMAP_PRIORITIES = {
  "/": 1,
  "/book-consultation": 0.95,
  "/contact": 0.9,
  "/skilled-migration": 0.9,
  "/destinations/australia": 0.92,
  "/partner-visa-australia": 0.9,
  "/student-visa-australia": 0.9,
  "/education-consultation": 0.85,
  "/updates": 0.85,
};

/** Footer “Services” column — keep aligned with high-value service landing pages. */
export const FOOTER_SERVICE_LINKS = [
  { href: "/skilled-migration", label: "Skilled Migration" },
  { href: "/migration-sri-lanka-to-australia", label: "Sri Lanka → Australia" },
  { href: "/student-visa-australia", label: "Student Visas" },
  { href: "/partner-visa-australia", label: "Partner Visa" },
  { href: "/employer-sponsored-visas", label: "Employer-Sponsored" },
  { href: "/visitor-visas", label: "Visitor Visas" },
  { href: "/education-consultation", label: "Education Consultation" },
  { href: "/updates", label: "Visa Updates" },
  { href: "/australia-visa-fees-and-costs-guide", label: "Visa Fees Guide" },
  { href: "/australia-visa-document-checklist-guide", label: "Document Checklist" },
];

/** Primary header nav on the main site (destination hubs use getDestinationNavLinks). */
export const GLOBAL_HEADER_PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/skilled-migration", label: "Skilled" },
  { href: "/partner-visa-australia", label: "Partner" },
  { href: "/student-visa-australia", label: "Student" },
  { href: "/education-consultation", label: "Education" },
  { href: "/updates", label: "Updates" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SITE_ORIGIN = "https://minroshmigration.com.au";

/**
 * Full URL list for Next.js sitemap (static + destination hubs + destination sections).
 * @param {Record<string, unknown>} destinationsJson — e.g. data/destinations.json
 */
export function buildPublicSitemapRoutes(destinationsJson) {
  const slugs = Object.keys(destinationsJson || {});
  const hubRoutes = slugs.map((slug) => `/destinations/${slug}`);
  const sectionRoutes = slugs.flatMap((slug) =>
    DESTINATION_SECTION_IDS.map((section) => `/destinations/${slug}/${section}`)
  );
  return [...STATIC_SITEMAP_ROUTES, ...hubRoutes, ...sectionRoutes];
}

export function sitemapUrlForPath(route) {
  return `${SITE_ORIGIN}${route === "/" ? "" : route}`;
}
