import { buildMetadata } from "@/lib/seo";
import seoPages from "@/data/seo-pages.json";

const contactSeo = seoPages.servicePages.contact;

/** Default /contact SEO — used when CMS SEO fields are empty or CMS is disabled. */
export const CONTACT_PAGE_SEO = {
  title: contactSeo.metaTitle,
  description: contactSeo.metaDescription,
  path: contactSeo.path,
  keywords: contactSeo.keywords,
};

/**
 * Build /contact metadata, optionally merging published CMS SEO overrides.
 * @param {import("@/lib/website/cms-loader").CmsSeoShape | null | undefined} cmsSeo
 */
export function buildContactPageMetadata(cmsSeo) {
  const title = String(cmsSeo?.title || "").trim() || CONTACT_PAGE_SEO.title;
  const description = String(cmsSeo?.description || "").trim() || CONTACT_PAGE_SEO.description;
  const keywords =
    Array.isArray(cmsSeo?.keywords) && cmsSeo.keywords.length > 0 ? cmsSeo.keywords : CONTACT_PAGE_SEO.keywords;
  const image = String(cmsSeo?.ogImage || "").trim() || undefined;
  const robots = cmsSeo?.noindex ? { index: false, follow: false } : undefined;

  const meta = buildMetadata({
    title,
    description,
    path: CONTACT_PAGE_SEO.path,
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
