import { test, expect } from "@playwright/test";

test.describe("admin auth wall", () => {
  test("unauthenticated /admin redirects to login with from=", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login\?/);
    const u = new URL(page.url());
    expect(u.searchParams.get("from")).toBe("/admin");
  });
});
