/** URL slug ↔ page path helpers for admin routes. */

/**
 * @param {string} path — e.g. "/about" or "/"
 */
export function pathToAdminSlug(path) {
  const p = String(path || "").trim();
  if (p === "/" || p === "") return "home";
  return p.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * @param {string} slug — e.g. "about" or "home"
 */
export function adminSlugToPath(slug) {
  const s = String(slug || "").trim();
  if (!s || s === "home") return "/";
  return `/${s.replace(/^\/+/, "")}`;
}

export const WEBSITE_PAGE_REGISTRY = [
  { slug: "/about", pageTitle: "About", adminSlug: "about" },
  { slug: "/contact", pageTitle: "Contact", adminSlug: "contact" },
  { slug: "/student-visa-australia", pageTitle: "Student Visa Australia", adminSlug: "student-visa-australia" },
  { slug: "/skilled-migration", pageTitle: "Skilled Migration", adminSlug: "skilled-migration" },
  {
    slug: "/post-study-visa-australia",
    pageTitle: "Post-Study Visa Australia",
    adminSlug: "post-study-visa-australia",
  },
  { slug: "/faq", pageTitle: "FAQ", adminSlug: "faq" },
  { slug: "/", pageTitle: "Homepage", adminSlug: "home" },
];
