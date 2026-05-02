/**
 * One-off preview captures for Stage 2 review. Requires standalone on PORT (default 4173).
 * Usage: PORT=4173 node scripts/stage2-preview-screenshots.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const outDir = path.join(process.cwd(), "reports/stage2-review");
fs.mkdirSync(outDir, { recursive: true });

async function capture() {
  const browser = await chromium.launch();
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${base}/`, { waitUntil: "load", timeout: 120_000 });
  await desktop.waitForTimeout(800);
  await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await desktop.waitForTimeout(600);
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await desktop.screenshot({ path: path.join(outDir, "home-desktop-fullpage.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${base}/`, { waitUntil: "load", timeout: 120_000 });
  await mobile.waitForTimeout(800);
  await mobile.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mobile.waitForTimeout(800);
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.screenshot({ path: path.join(outDir, "home-mobile-390-fullpage.png"), fullPage: true });

  const tools = mobile.locator('section[aria-labelledby="home-tools-heading"]');
  await tools.scrollIntoViewIfNeeded();
  await tools.screenshot({ path: path.join(outDir, "home-mobile-390-tools-section.png") });

  const feedback = mobile.locator("section.home-section").filter({ has: mobile.getByRole("heading", { name: "Client feedback" }) });
  await feedback.first().scrollIntoViewIfNeeded();
  await feedback.first().screenshot({ path: path.join(outDir, "home-mobile-390-client-feedback-section.png") });

  await browser.close();
  console.log("Wrote:", outDir);
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
