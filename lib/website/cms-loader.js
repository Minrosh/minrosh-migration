/**
 * Website CMS feature flag and public route content loader.
 */

import { draftMode } from "next/headers";
import { getPublishedPageBySlug, getWebsitePageBySlugForAdmin } from "@/lib/website/pages-store";

export function isWebsiteCmsEnabled() {
  return String(process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED || "").trim().toLowerCase() === "true";
}

/**
 * @typedef {Object} CmsSeoShape
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [canonical]
 * @property {string} [ogTitle]
 * @property {string} [ogDescription]
 * @property {string} [ogImage]
 * @property {boolean} [noindex]
 * @property {string[]} [keywords]
 */

/**
 * Returns published CMS page content for rendering, or null → legacy fallback.
 * @param {string} slug — e.g. "/about"
 * @param {{ preview?: boolean, draftContent?: unknown }} [options]
 */
export function getPageForRender(slug, options = {}) {
  if (!isWebsiteCmsEnabled() && !options.preview) {
    return null;
  }
  let page = null;
  try {
    page = getPublishedPageBySlug(slug, { forPublic: true });
  } catch (err) {
    console.error("[website-cms] getPublishedPageBySlug failed:", slug, err);
    return null;
  }
  if (!page) return null;
  if (options.preview && options.draftContent) {
    return options.draftContent;
  }
  const published = page.published;
  if (!published || !Array.isArray(published.sections) || published.sections.length === 0) {
    return null;
  }
  return {
    slug: page.slug,
    pageTitle: page.pageTitle,
    seo: page.seo,
    sections: published.sections,
    publishedAt: published.publishedAt,
  };
}

/**
 * Route-level loader: published content, or draft when Next.js draft mode is enabled (staging).
 * Returns null → render legacy page unchanged.
 * @param {string} slug
 */
export async function getPageForRenderOnRoute(slug) {
  if (!isWebsiteCmsEnabled()) {
    return null;
  }
  try {
    const draft = await draftMode();
    if (draft.isEnabled) {
      const adminPage = getWebsitePageBySlugForAdmin(slug);
      const draftSections = adminPage.ok ? adminPage.page?.draft?.sections : [];
      if (Array.isArray(draftSections) && draftSections.length > 0) {
        return {
          slug,
          pageTitle: adminPage.page?.pageTitle,
          seo: adminPage.page?.seo,
          sections: draftSections,
          isDraftPreview: true,
        };
      }
    }
  } catch (err) {
    console.error("[website-cms] draft mode read failed:", slug, err);
  }
  return getPageForRender(slug);
}

/**
 * Optional CMS SEO override; returns null when CMS SEO fields are empty.
 * @param {string} slug
 */
export function getCmsSeoForSlug(slug) {
  if (!isWebsiteCmsEnabled()) return null;
  try {
    const page = getPublishedPageBySlug(slug, { forPublic: true });
    if (!page?.seo) return null;
    const seo = page.seo;
    const hasAny =
      seo.title ||
      seo.description ||
      seo.canonical ||
      seo.ogTitle ||
      seo.ogDescription ||
      seo.ogImage ||
      seo.noindex ||
      (Array.isArray(seo.keywords) && seo.keywords.length > 0);
    return hasAny ? seo : null;
  } catch (err) {
    console.error("[website-cms] getCmsSeoForSlug failed:", slug, err);
    return null;
  }
}
