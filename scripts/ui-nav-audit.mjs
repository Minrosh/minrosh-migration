import { chromium } from "@playwright/test";

const BASE_URL = process.env.UI_AUDIT_BASE_URL || "http://localhost:3000";
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

async function expectOk(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
  const status = response?.status?.() ?? 0;
  if (!response || status >= 400) {
    fail(`${path} returned status ${status}`);
    return false;
  }
  return true;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (err) => fail(`Page error: ${err.message}`));
  page.on("response", (res) => {
    const url = res.url();
    if (!url.startsWith(BASE_URL)) return;
    if (url.includes("/_next/")) return;
    if (res.status() >= 500) fail(`Server error ${res.status()} at ${url}`);
  });

  const smokeRoutes = [
    "/",
    "/about",
    "/contact",
    "/faq",
    "/skilled-migration",
    "/student-visa-australia",
    "/partner-visa-australia",
    "/visitor-visas",
    "/destinations/australia",
    "/immigration-news",
    "/updates",
    "/admin",
    "/admin/crm",
    "/admin/customers",
    "/admin/invoices",
  ];

  for (const route of smokeRoutes) {
    await expectOk(page, route);
  }

  if (await expectOk(page, "/")) {
    try {
      await page.getByText("Explore pathways", { exact: false }).first().scrollIntoViewIfNeeded();
      const smartInput = page.locator('input[type="text"]').first();
      await smartInput.fill("Skilled visa after study in Australia");
      await page.getByRole("link", { name: "Run Smart Navigator" }).first().click();
      await page.waitForTimeout(250);
      const hash = new URL(page.url()).hash;
      if (!hash.includes("smart-navigator")) fail("Run Smart Navigator did not navigate to #smart-navigator");
      const hint = page.getByText("Using your typed intent:", { exact: false });
      if ((await hint.count()) === 0) fail("Typed intent hint did not appear in Smart Navigator");
    } catch (err) {
      fail(`Smart Navigator CTA flow failed: ${err.message}`);
    }

    try {
      const discoverSection = page.locator("section").filter({ hasText: "Explore pathways" }).first();
      const startPathway = discoverSection.locator('a[href="/assessment"]').first();
      await startPathway.scrollIntoViewIfNeeded();
      await startPathway.click();
      await page.waitForURL(/\/assessment/, { timeout: 8000 });
    } catch (err) {
      fail(`Start your pathway flow failed: ${err.message}`);
    }
  }

  if (await expectOk(page, "/admin")) {
    const showAll = page.getByRole("button", { name: "Show all" }).first();
    if (await showAll.count()) {
      await showAll.click();
    }
    const adminLinks = [
      { name: "CRM", path: "/admin/crm" },
      { name: "Customers", path: "/admin/customers" },
      { name: "Invoices", path: "/admin/invoices" },
    ];
    for (const link of adminLinks) {
      try {
        const adminAside = page.locator("aside").first();
        await adminAside.getByRole("link", { name: link.name }).first().click();
        await page.waitForTimeout(180);
        if (!page.url().includes(link.path)) fail(`Admin nav "${link.name}" did not reach ${link.path}`);
      } catch (err) {
        fail(`Admin nav "${link.name}" interaction failed: ${err.message}`);
      }
    }
  }

  await browser.close();

  if (failures.length) {
    console.error(`\nUI nav audit failed with ${failures.length} issue(s).`);
    process.exit(1);
  }
  console.log("UI nav audit passed.");
}

run().catch((err) => {
  console.error("UI nav audit crashed:", err);
  process.exit(1);
});
