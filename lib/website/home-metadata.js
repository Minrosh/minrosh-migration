import { buildMetadata } from "@/lib/seo";

export const HOME_PAGE_SEO = {
  title: "Migration Agent Brisbane | Start Your Pathway Check",
  description:
    "Brisbane-based migration and education guidance for Australia, Canada, the UK and New Zealand. Start with a free pathway check and planning tools.",
  path: "/",
  keywords: [
    "migration agent Brisbane",
    "Australia visa guidance",
    "student visa Australia",
    "skilled migration planning",
    "partner visa guidance",
  ],
};

/** @param {import("@/lib/website/cms-loader").CmsSeoShape | null | undefined} cmsSeo */
export function buildHomePageMetadata(cmsSeo) {
  const title = String(cmsSeo?.title || "").trim() || HOME_PAGE_SEO.title;
  const description = String(cmsSeo?.description || "").trim() || HOME_PAGE_SEO.description;
  const keywords =
    Array.isArray(cmsSeo?.keywords) && cmsSeo.keywords.length > 0
      ? cmsSeo.keywords
      : HOME_PAGE_SEO.keywords;
  const image = String(cmsSeo?.ogImage || "").trim() || undefined;
  const robots = cmsSeo?.noindex ? { index: false, follow: false } : undefined;

  const meta = buildMetadata({
    title,
    description,
    path: HOME_PAGE_SEO.path,
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
