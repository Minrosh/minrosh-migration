/**
 * Isolates Website CMS JSON stores for Vitest.
 * CMS tests must never mutate `data/website-pages.json` directly.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach } from "vitest";
import {
  websitePagesSeed,
  websiteVersionsSeed,
} from "@/lib/admin/paths";
import {
  getWebsitePagesFile,
  getWebsiteVersionsFile,
} from "@/lib/website/cms-data-paths";

const workerId = process.env.VITEST_WORKER_ID ?? String(process.pid);
const testDataRoot = path.join(os.tmpdir(), "minrosh-website-cms-tests", workerId);

process.env.WEBSITE_CMS_TEST_DATA_DIR = testDataRoot;

export function resetWebsiteCmsTestDataFiles() {
  fs.mkdirSync(testDataRoot, { recursive: true });
  fs.copyFileSync(websitePagesSeed, getWebsitePagesFile());
  fs.copyFileSync(websiteVersionsSeed, getWebsiteVersionsFile());
}

beforeEach(() => {
  resetWebsiteCmsTestDataFiles();
});
