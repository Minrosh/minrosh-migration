import { buildMetadata } from "@/lib/seo";
import seoPages from "@/data/seo-pages.json";

const pageSeo = seoPages.servicePages.studentVisa;

/** Default /student-visa-australia SEO — used when CMS SEO fields are empty or CMS is disabled. */
export const STUDENT_VISA_AUSTRALIA_PAGE_SEO = {
  title: pageSeo.metaTitle,
  description: pageSeo.metaDescription,
  path: pageSeo.path,
  keywords: pageSeo.keywords,
};

/**
 * Build /student-visa-australia metadata, optionally merging published CMS SEO overrides.
 * @param {import("@/lib/website/cms-loader").CmsSeoShape | null | undefined} cmsSeo
 */
export function buildStudentVisaAustraliaPageMetadata(cmsSeo) {
  const title = String(cmsSeo?.title || "").trim() || STUDENT_VISA_AUSTRALIA_PAGE_SEO.title;
  const description = String(cmsSeo?.description || "").trim() || STUDENT_VISA_AUSTRALIA_PAGE_SEO.description;
  const keywords =
    Array.isArray(cmsSeo?.keywords) && cmsSeo.keywords.length > 0
      ? cmsSeo.keywords
      : STUDENT_VISA_AUSTRALIA_PAGE_SEO.keywords;
  const image = String(cmsSeo?.ogImage || "").trim() || undefined;
  const robots = cmsSeo?.noindex ? { index: false, follow: false } : undefined;

  const meta = buildMetadata({
    title,
    description,
    path: STUDENT_VISA_AUSTRALIA_PAGE_SEO.path,
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
