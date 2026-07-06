import destinations from "@/data/destinations.json";

export function pathToAdminSlug(path) {
  const p = String(path || "").trim();
  if (p === "/" || p === "") return "home";
  return p.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\//g, "-");
}

export function adminSlugToPath(slug) {
  const s = String(slug || "").trim();
  if (!s || s === "home") return "/";
  if (s.startsWith("destinations-")) {
    return `/destinations/${s.replace(/^destinations-/, "")}`;
  }
  return `/${s.replace(/^\/+/, "")}`;
}

const DESTINATION_REGISTRY = Object.keys(destinations).map((slug) => ({
  slug: `/destinations/${slug}`,
  pageTitle: `${destinations[slug].name} hub`,
  adminSlug: `destinations-${slug}`,
}));

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
  ...DESTINATION_REGISTRY,
  { slug: "/", pageTitle: "Homepage", adminSlug: "home" },
];
