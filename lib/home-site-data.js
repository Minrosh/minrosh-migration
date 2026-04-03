import fs from "node:fs";
import path from "node:path";
import { readJsonFile } from "./contact";

/**
 * Merges admin-managed success stories (data/success-stories.json) ahead of site.json defaults.
 * Reads from disk at runtime so PM2 cwd must contain ./data/ (see copy-standalone-assets.mjs).
 */
export function getHomeSiteData(siteDataStatic) {
  const dataDir = path.join(process.cwd(), "data");
  const adminFile = path.join(dataDir, "success-stories.json");
  if (!fs.existsSync(adminFile)) {
    return siteDataStatic;
  }
  const admin = readJsonFile(adminFile, { stories: [] });
  const extra = Array.isArray(admin.stories) ? admin.stories : [];
  if (!extra.length) {
    return siteDataStatic;
  }
  const base = siteDataStatic.successStories || [];
  return {
    ...siteDataStatic,
    successStories: [...extra, ...base],
  };
}
