import { buildMetadata } from "@/lib/seo";
import seoPages from "@/data/seo-pages.json";

const faqSeo = seoPages.servicePages.faqHub;

/** Default /faq SEO — used when CMS SEO fields are empty or CMS is disabled. */
export const FAQ_PAGE_SEO = {
  title: faqSeo.metaTitle,
  description: faqSeo.metaDescription,
  path: faqSeo.path,
  keywords: faqSeo.keywords,
};

/**
 * Build /faq metadata, optionally merging published CMS SEO overrides.
 * @param {import("@/lib/website/cms-loader").CmsSeoShape | null | undefined} cmsSeo
 */
export function buildFaqPageMetadata(cmsSeo) {
  const title = String(cmsSeo?.title || "").trim() || FAQ_PAGE_SEO.title;
  const description = String(cmsSeo?.description || "").trim() || FAQ_PAGE_SEO.description;
  const keywords =
    Array.isArray(cmsSeo?.keywords) && cmsSeo.keywords.length > 0 ? cmsSeo.keywords : FAQ_PAGE_SEO.keywords;
  const image = String(cmsSeo?.ogImage || "").trim() || undefined;
  const robots = cmsSeo?.noindex ? { index: false, follow: false } : undefined;

  const meta = buildMetadata({
    title,
    description,
    path: FAQ_PAGE_SEO.path,
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
