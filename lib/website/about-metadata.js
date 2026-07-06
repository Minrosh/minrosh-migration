import { buildMetadata } from "@/lib/seo";

/** Default /about SEO — used when CMS SEO fields are empty or CMS is disabled. */
export const ABOUT_PAGE_SEO = {
  title: "About MinRosh Migration | Brisbane Migration Guidance",
  description:
    "Learn more about MinRosh Migration, our Brisbane-based approach, and how we support skilled, student, partner, and education pathways with structured guidance.",
  path: "/about",
  keywords: [
    "about MinRosh Migration",
    "Brisbane migration guidance",
    "migration consultancy Brisbane",
  ],
};

/**
 * Build /about metadata, optionally merging published CMS SEO overrides.
 * @param {import("@/lib/website/cms-loader").CmsSeoShape | null | undefined} cmsSeo
 */
export function buildAboutPageMetadata(cmsSeo) {
  const title = String(cmsSeo?.title || "").trim() || ABOUT_PAGE_SEO.title;
  const description = String(cmsSeo?.description || "").trim() || ABOUT_PAGE_SEO.description;
  const keywords =
    Array.isArray(cmsSeo?.keywords) && cmsSeo.keywords.length > 0 ? cmsSeo.keywords : ABOUT_PAGE_SEO.keywords;
  const image = String(cmsSeo?.ogImage || "").trim() || undefined;
  const robots = cmsSeo?.noindex ? { index: false, follow: false } : undefined;

  const meta = buildMetadata({
    title,
    description,
    path: ABOUT_PAGE_SEO.path,
    keywords,
    ...(image ? { image } : {}),
    ...(robots ? { robots } : {}),
  });

  if (cmsSeo?.ogTitle || cmsSeo?.ogDescription) {
    meta.openGraph = {
      ...meta.openGraph,
      ...(cmsSeo.ogTitle ? { title: cmsSeo.ogTitle } : {}),
      ...(cmsSeo.ogDescription ? { description: cmsSeo.ogDescription } : {}),
    };
    meta.twitter = {
      ...meta.twitter,
      ...(cmsSeo.ogTitle ? { title: cmsSeo.ogTitle } : {}),
      ...(cmsSeo.ogDescription ? { description: cmsSeo.ogDescription } : {}),
    };
  }

  return meta;
}
