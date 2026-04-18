import { STATIC_SITEMAP_ROUTES } from "./public-indexable-routes";

/**
 * Extra typeahead tokens (subclasses, acronyms) mapped to existing pages.
 * @type {Record<string, string[]>}
 */
const EXTRA_TERMS_BY_PATH = {
  "/": ["minrosh", "homepage"],
  "/skilled-migration": ["189", "190", "491", "eoi", "skillselect", "points", "anzsco", "pr", "gsm"],
  "/skilled-migration-australia-points-guide": ["points test", "65 points", "competitive"],
  "/partner-visa-australia": ["820", "801", "309", "100", "spouse", "de facto", "relationship"],
  "/partner-visa-820-801-guide": ["onshore", "820", "801"],
  "/partner-visa-309-100-guide": ["offshore", "309", "100"],
  "/student-visa-australia": ["500", "subclass 500", "coe", "genuine student"],
  "/employer-sponsored-visas": ["482", "sid", "tsmit", "sponsorship", "skills in demand"],
  "/visitor-visas": ["600", "tourist", "holiday"],
  "/book-consultation": ["book", "appointment", "paid"],
  "/assessment": ["wizard", "quiz", "free"],
  "/visa-refusal-help-australia-and-aat-migration-appeal-guide": ["refusal", "aat", "review", "appeal"],
  "/immigration-lawyer-australia-vs-registered-migration-agent-guide": ["lawyer", "agent", "mara", "omara"],
  "/australia-visa-document-checklist-guide": ["documents", "checklist", "evidence"],
  "/australia-visa-fees-and-costs-guide": ["fees", "cost", "vac"],
  "/australia-visa-processing-times-guide": ["processing", "timeline", "wait"],
  "/australian-visas-official-sources": [
    "visa list",
    "subclass",
    "home affairs",
    "visa finder",
    "department of home affairs",
    "immiaccount",
    "vevo",
    "official visa",
  ],
};

function slugToLabel(href) {
  if (href === "/") return "Home";
  const slug = href.replace(/^\//, "");
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * @typedef {{ href: string, label: string, terms: string[] }} SiteSearchEntry
 */

/** Curated site search / typeahead index (kept in sync with static sitemap routes). */
export const SITE_SEARCH_INDEX = STATIC_SITEMAP_ROUTES.map((href) => {
  const label = slugToLabel(href);
  const slugWords = href === "/" ? ["home"] : href.slice(1).split("-");
  const baseTerms = [label.toLowerCase(), ...slugWords];
  const extra = EXTRA_TERMS_BY_PATH[href] || [];
  const terms = [...new Set([...baseTerms, ...extra.map((t) => String(t).toLowerCase())])].filter(Boolean);
  return { href, label, terms };
});

/**
 * @param {string} query
 * @param {{ limit?: number }} [opts]
 * @returns {SiteSearchEntry[]}
 */
export function filterSiteSearch(query, opts = {}) {
  const limit = opts.limit ?? 8;
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return [];
  return SITE_SEARCH_INDEX.filter((entry) => {
    if (entry.label.toLowerCase().includes(q)) return true;
    if (entry.href.toLowerCase().includes(q)) return true;
    return entry.terms.some((t) => t.includes(q));
  }).slice(0, limit);
}
