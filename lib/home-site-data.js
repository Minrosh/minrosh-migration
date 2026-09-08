import { buildWhatsAppUrl } from "./whatsapp-prefill";
import { isPublishableMarn, COMPLIANCE_FEATURE_FLAGS } from "./compliance";

/** Prefill for the homepage hero WhatsApp CTA (prepared server-side). */
const HOME_HERO_WHATSAPP_MESSAGE =
  "Hi MinRosh, I would like general migration information or education-course support.";

/**
 * Legacy MARN overlay — only when authorised RMA mode is explicitly enabled
 * and a real numeric MARN is provided. Placeholders like "Available on request" are never published.
 */
export function withPublicMarn(siteData) {
  if (!COMPLIANCE_FEATURE_FLAGS.AUTHORISED_RMA_MODE) {
    if (!siteData?.brand) return siteData;
    const { marn: _removed, ...brand } = siteData.brand;
    return { ...siteData, brand };
  }
  const envMarn =
    typeof process.env.NEXT_PUBLIC_MARN === "string" ? process.env.NEXT_PUBLIC_MARN.trim() : "";
  const current = String(siteData.brand?.marn || "").trim();
  const candidate = isPublishableMarn(current) ? current : isPublishableMarn(envMarn) ? envMarn : "";
  if (!candidate) {
    const { marn: _removed, ...brand } = siteData.brand || {};
    return { ...siteData, brand };
  }
  return {
    ...siteData,
    brand: { ...siteData.brand, marn: candidate },
  };
}

/**
 * Public site does not surface testimonials / success stories in no-MARN mode
 * until legal review verifies quotes are limited to education support / customer service.
 * Admin `data/success-stories.json` remains available for internal draft storage only.
 */
export function getHomeSiteData(siteDataStatic) {
  const withMarn = withPublicMarn(siteDataStatic);
  return {
    ...withMarn,
    successStories: [],
  };
}

/**
 * Strip sensitive or server-only brand fields before passing `siteData` to client components.
 * @param {object} siteData
 */
function sanitizeBrandForPublicClient(siteData) {
  return {
    ...siteData,
    brand: {
      ...siteData.brand,
      email: "",
    },
  };
}

/**
 * Shape passed to client-only widgets (e.g. WhatsApp shell) — strip fields that must not leak to the browser.
 * JSON-LD and server metadata should continue to use full {@link getHomeSiteData} output where appropriate.
 * @param {object} siteData — output of {@link getHomeSiteData}
 */
export function getSiteDataForClientWidgets(siteData) {
  return sanitizeBrandForPublicClient(siteData);
}

/**
 * Everything `app/layout.js` needs: merged site data for JSON-LD / server use, plus a public-safe copy for client widgets.
 * @param {object} siteDataStatic — imported `data/site.json`
 * @returns {{ siteData: object, publicSiteData: object }}
 */
export function getRootLayoutPreparedData(siteDataStatic) {
  const siteData = getHomeSiteData(siteDataStatic);
  return {
    siteData,
    publicSiteData: getSiteDataForClientWidgets(siteData),
  };
}

/**
 * Homepage view model: merged site data plus derived WhatsApp href for the hero CTA.
 * @param {object} siteDataStatic — imported `data/site.json`
 * @returns {{ siteData: object, homeHeroWhatsAppHref: string }}
 */
export function getHomePagePreparedData(siteDataStatic) {
  const siteData = getHomeSiteData(siteDataStatic);
  return {
    siteData,
    homeHeroWhatsAppHref: buildWhatsAppUrl(siteData.brand?.whatsapp, HOME_HERO_WHATSAPP_MESSAGE),
  };
}
