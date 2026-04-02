import fs from "node:fs";
import path from "node:path";
import { ensureEnquiriesFile, readJsonFile } from "./contact";
import { ensureNewsletterFile } from "./newsletter";

const enquiriesFile =
  process.env.ENQUIRIES_FILE || path.join(process.cwd(), "data-enquiries.json");
const newsletterFile =
  process.env.NEWSLETTER_FILE || path.join(process.cwd(), "data-newsletter.json");
const newsFile = path.join(process.cwd(), "data", "news.json");

function countItems(filePath, ensureFile) {
  ensureFile();
  const items = readJsonFile(filePath, []);
  return Array.isArray(items) ? items.length : 0;
}

export function getFooterStats() {
  const enquiryCount = countItems(enquiriesFile, ensureEnquiriesFile);
  const newsletterCount = countItems(newsletterFile, ensureNewsletterFile);
  const updates = readJsonFile(newsFile, []);
  const updatesCount = Array.isArray(updates) ? updates.length : 0;

  return {
    enquiryCount,
    newsletterCount,
    updatesCount,
  };
}
