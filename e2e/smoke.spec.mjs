import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/General Migration Information|Education Support|MinRosh Migration/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("contact page shows privacy checkbox", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator('input[type="checkbox"][name="privacyPolicyAccepted"]').first()).toBeVisible();
    await expect(page.locator('input[type="checkbox"][name="formAcknowledgementAccepted"]').first()).toBeVisible();
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
