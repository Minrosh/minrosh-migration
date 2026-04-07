import fs from "node:fs";
import path from "node:path";
import { readJsonFile } from "./contact";

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
