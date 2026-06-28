import { chromium, devices } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

const BASE = "http://127.0.0.1:3001";
const OUT = "reports/website-cms-sprint-3g-screenshots";

async function main() {
  execSync(`mkdir -p ${OUT}`);
  execSync(
    `WEBSITE_CMS_TEST_DATA_DIR=${path.join(process.cwd(), ".next/standalone/data")} node scripts/seed-staging-chrome.mjs`
  );
  execSync("pm2 delete minrosh-staging || true", { stdio: "ignore" });
  execSync("pm2 start ecosystem.staging.config.js", { stdio: "inherit" });
  execSync("sleep 4");

  const browser = await chromium.launch();
  for (const [name, mobile] of [
    ["header-footer-cms-desktop", false],
    ["header-footer-cms-mobile", true],
  ]) {
    const ctx = await browser.newContext(
      mobile ? { ...devices["iPhone 13"] } : { viewport: { width: 1440, height: 900 } }
    );
    const page = await ctx.newPage();
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle", timeout: 90000 });
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    await ctx.close();
  }
  await browser.close();
  console.log("saved screenshots to", OUT);
}

main();
