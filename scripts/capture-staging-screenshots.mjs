import { chromium, devices } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

const BASE = process.env.STAGING_BASE_URL || "http://127.0.0.1:3001";
const ROOT = process.cwd();

async function setCmsMode(on) {
  const config = on ? "ecosystem.staging.config.js" : "ecosystem.staging.cms-off.config.js";
  execSync(`pm2 delete minrosh-staging || true`, { stdio: "ignore" });
  execSync(`pm2 start ${path.join(ROOT, config)}`, { stdio: "inherit" });
  execSync("sleep 4");
  if (on) {
    execSync(`WEBSITE_CMS_TEST_DATA_DIR=${path.join(ROOT, ".next/standalone/data")} node ${path.join(ROOT, "scripts/seed-staging-cms-pages.mjs")}`, {
      stdio: "inherit",
    });
    execSync("pm2 restart minrosh-staging", { stdio: "inherit" });
    execSync("sleep 3");
  }
}

const shots = [
  {
    dir: "reports/website-cms-sprint-3e-screenshots",
    pages: [
      { name: "post-study-legacy-desktop-cms-off", path: "/post-study-visa-australia", cmsOn: false, mobile: false },
      { name: "post-study-cms-desktop-cms-on", path: "/post-study-visa-australia", cmsOn: true, mobile: false },
      { name: "post-study-cms-mobile-cms-on", path: "/post-study-visa-australia", cmsOn: true, mobile: true },
    ],
  },
  {
    dir: "reports/website-cms-sprint-3f-screenshots",
    pages: [
      { name: "faq-legacy-desktop-cms-off", path: "/faq", cmsOn: false, mobile: false },
      { name: "faq-cms-desktop-cms-on", path: "/faq", cmsOn: true, mobile: false },
      { name: "faq-cms-mobile-cms-on", path: "/faq", cmsOn: true, mobile: true },
    ],
  },
];

async function capture(browser, shot, groupDir) {
  const context = await browser.newContext(
    shot.mobile ? { ...devices["iPhone 13"] } : { viewport: { width: 1440, height: 900 } },
  );
  const page = await context.newPage();
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle", timeout: 90000 });
  const outfile = path.join(groupDir, `${shot.name}.png`);
  await page.screenshot({ path: outfile, fullPage: true });
  console.log("saved", outfile);
  await context.close();
}

async function main() {
  const browser = await chromium.launch();
  for (const cmsOn of [true, false]) {
    await setCmsMode(cmsOn);
    for (const group of shots) {
      for (const shot of group.pages.filter((s) => s.cmsOn === cmsOn)) {
        await capture(browser, shot, group.dir);
      }
    }
  }
  await browser.close();
  await setCmsMode(true);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
