import { test, expect } from "@playwright/test";

/**
 * Ensures the pre-hydration dismiss script removes the route-boundary loader
 * once #main-content is present (homepage shell).
 */
test.describe("route loading dismiss", () => {
  test("pre-hydration script removes route-boundary overlay", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });

    await expect(page.locator('script[src*="dismiss-route-loading"]')).toHaveCount(1);

    await page.waitForFunction(
      () => document.querySelectorAll(".loading-screen--route-boundary").length === 0,
      { timeout: 10_000 },
    );

    await expect(page.locator(".loading-screen--route-boundary")).toHaveCount(0);
  });
});
