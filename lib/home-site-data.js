import fs from "node:fs";
import path from "node:path";
import { readJsonFile } from "./contact";
import { buildWhatsAppUrl } from "./whatsapp-prefill";

/** Prefill for the homepage hero WhatsApp CTA (prepared server-side). */
const HOME_HERO_WHATSAPP_MESSAGE =
  "Hi MinRosh Migration, I would like to discuss scheduling or general pathway questions.";

/**
 * Overlay MARN from NEXT_PUBLIC_MARN when site.json brand.marn is empty (useful in production env).
 */
export function withPublicMarn(siteData) {
  const envMarn =
    typeof process.env.NEXT_PUBLIC_MARN === "string" ? process.env.NEXT_PUBLIC_MARN.trim() : "";
  if (!envMarn) return siteData;
  const current = String(siteData.brand?.marn || "").trim();
  if (current) return siteData;
  return {
    ...siteData,
    brand: { ...siteData.brand, marn: envMarn },
  };
}

/**
 * Merges admin-managed success stories (data/success-stories.json) ahead of site.json defaults.
 * Reads from disk at runtime so PM2 cwd must contain ./data/ (see copy-standalone-assets.mjs).
 */
export function getHomeSiteData(siteDataStatic) {
  const dataDir = path.join(process.cwd(), "data");
  const adminFile = path.join(dataDir, "success-stories.json");
  if (!fs.existsSync(adminFile)) {
    return withPublicMarn(siteDataStatic);
  }
  const admin = readJsonFile(adminFile, { stories: [] });
  const extra = Array.isArray(admin.stories) ? admin.stories : [];
  if (!extra.length) {
    return withPublicMarn(siteDataStatic);
  }
  const base = siteDataStatic.successStories || [];
  return withPublicMarn({
    ...siteDataStatic,
    successStories: [...extra, ...base],
  });
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
