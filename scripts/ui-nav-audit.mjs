import { chromium } from "@playwright/test";

const BASE_URL = process.env.UI_AUDIT_BASE_URL || "http://localhost:3000";
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

async function expectOk(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: "load" });
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
    "/popular-routes",
    "/assessment",
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
      await page.waitForLoadState("domcontentloaded");
      const startPathway = page.locator("#hero-cta-assessment");
      await startPathway.waitFor({ state: "visible", timeout: 25_000 });
      await page.evaluate(() => {
        const el = document.getElementById("hero-cta-assessment");
        if (!(el instanceof HTMLElement)) throw new Error("missing #hero-cta-assessment");
        el.click();
      });
      await page.waitForURL(/\/assessment/, { timeout: 15_000 });
      await page.getByText(/Smart Navigator|Visa Decision Engine/i).first().waitFor({ timeout: 12_000 });
    } catch (err) {
      fail(`Start your pathway flow failed: ${err.message}`);
    }
  }

  if (await expectOk(page, "/admin")) {
    if (new URL(page.url()).pathname === "/admin/login") {
      console.log("Admin auth wall detected; skipping authenticated admin sidebar nav checks.");
      await browser.close();

      if (failures.length) {
        console.error(`\nUI nav audit failed with ${failures.length} issue(s).`);
        process.exit(1);
      }
      console.log("UI nav audit passed.");
      return;
    }

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
