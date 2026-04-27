import fs from "node:fs";
import path from "node:path";
import { ensureEnquiriesFile, getEnquiriesFilePath, readJsonFile } from "./contact";
import { ensureNewsletterFile } from "./newsletter";
import { readNewsList } from "./news-store";

const enquiriesFile = getEnquiriesFilePath();
const newsletterFile =
  process.env.NEWSLETTER_FILE || path.join(process.cwd(), "data-newsletter.json");

function countItems(filePath, ensureFile) {
  ensureFile();
  const items = readJsonFile(filePath, []);
  return Array.isArray(items) ? items.length : 0;
}

export function getFooterStats() {
  const enquiryCount = countItems(enquiriesFile, ensureEnquiriesFile);
  const newsletterCount = countItems(newsletterFile, ensureNewsletterFile);
  const updates = readNewsList();
  const updatesCount = Array.isArray(updates) ? updates.length : 0;

  return {
    enquiryCount,
    newsletterCount,
    updatesCount,
  };
}
