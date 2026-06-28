import path from "node:path";
import {
  dataDir,
  websitePagesFile,
  websitePagesSeed,
  websiteVersionsFile,
  websiteVersionsSeed,
} from "@/lib/admin/paths";

/**
 * Optional override for CMS JSON stores during Vitest runs.
 * When set, pages/version stores read and write under this directory instead of `data/`.
 */
export function getWebsiteCmsDataDir() {
  const override = String(process.env.WEBSITE_CMS_TEST_DATA_DIR || "").trim();
  if (override) return path.resolve(override);
  return dataDir;
}

export function getWebsitePagesFile() {
  const override = String(process.env.WEBSITE_CMS_TEST_DATA_DIR || "").trim();
  if (override) {
    return path.join(getWebsiteCmsDataDir(), "website-pages.json");
  }
  return websitePagesFile;
}

export function getWebsitePagesSeed() {
  return websitePagesSeed;
}

export function getWebsiteVersionsFile() {
  const override = String(process.env.WEBSITE_CMS_TEST_DATA_DIR || "").trim();
  if (override) {
    return path.join(getWebsiteCmsDataDir(), "website-versions.json");
  }
  return websiteVersionsFile;
}

export function getWebsiteVersionsSeed() {
  return websiteVersionsSeed;
}
