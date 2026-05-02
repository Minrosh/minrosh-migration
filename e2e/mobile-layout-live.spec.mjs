import { test, expect } from "@playwright/test";

const LIVE = Boolean(process.env.PLAYWRIGHT_LIVE_URL?.trim());

const WIDTHS = [320, 360, 390, 414, 430, 768];

/** Stage 1 priority public routes */
const PATHS = [
  "/",
  "/student-visa-australia",
  "/education-consultation",
  "/destinations/australia",
  "/destinations/australia/student",
  "/destinations/canada",
  "/destinations/united-kingdom",
  "/destinations/new-zealand",
  "/tools",
  "/tools/student-country-cost-planner",
  "/tools/pr-pathway-explorer",
  "/assessment",
  "/contact",
];

(LIVE ? test.describe : test.describe.skip)("mobile layout — production (set PLAYWRIGHT_LIVE_URL)", () => {
  for (const width of WIDTHS) {
    test.describe(`${width}px`, () => {
      for (const path of PATHS) {
        test(`${path}`, async ({ page }) => {
          await page.setViewportSize({ width, height: Math.max(900, Math.round(width * 2)) });
          const res = await page.goto(path, {
            waitUntil: "domcontentloaded",
            timeout: 90_000,
          });
          expect(res?.ok(), `HTTP ${res?.status()} for ${path}`).toBeTruthy();

          const overflow = await page.evaluate(() => {
            const root = document.documentElement;
            const body = document.body;
            const cw = root.clientWidth;
            const docGap = Math.max(0, root.scrollWidth - cw);
            const bodyGap = body ? Math.max(0, body.scrollWidth - cw) : 0;
            const main = document.querySelector("main");
            let mainW = 0;
            if (main) {
              mainW = main.getBoundingClientRect().width;
            }
            return { docGap, bodyGap, cw, mainW };
          });

          expect(
            overflow.docGap,
            `document horizontal overflow (${overflow.docGap}px) @ ${width}px ${path}`,
          ).toBeLessThanOrEqual(2);
          expect(
            overflow.bodyGap,
            `body horizontal overflow (${overflow.bodyGap}px) @ ${width}px ${path}`,
          ).toBeLessThanOrEqual(2);
          if (overflow.mainW > 0) {
            expect(
              overflow.mainW,
              `<main> wider than viewport (${overflow.mainW} vs ${overflow.cw}) @ ${width}px ${path}`,
            ).toBeLessThanOrEqual(overflow.cw + 2);
          }

          const headerBlocksMain = await page.evaluate(() => {
            const header = document.querySelector("header.site-header");
            const main = document.querySelector("main");
            if (!header || !main) return { ok: true, reason: "missing-header-or-main" };
            const hr = header.getBoundingClientRect();
            /** First in-flow block inside main (skip visually hidden sr-only). */
            const nodes = Array.from(main.querySelectorAll(":scope > *"));
            const block = nodes.find((el) => {
              const cs = window.getComputedStyle(el);
              const r = el.getBoundingClientRect();
              if (r.height < 8 || r.width < 8) return false;
              if (cs.display === "none" || cs.visibility === "hidden") return false;
              return true;
            });
            if (!block) return { ok: true, reason: "no-main-child" };
            const br = block.getBoundingClientRect();
            /** Visible height of first section below sticky header bottom. */
            const visibleBelowHeaderTop = Math.max(br.top, hr.bottom);
            const visibleH = Math.max(0, br.bottom - visibleBelowHeaderTop);
            const minNeed = Math.min(56, Math.max(32, br.height * 0.25));
            const ok = visibleH >= minNeed || br.top >= hr.bottom - 2;
            return { ok, visibleH, minNeed, brTop: br.top, hb: hr.bottom, brH: br.height };
          });

          expect(
            headerBlocksMain.ok,
            `sticky header may be covering first main section (${JSON.stringify(headerBlocksMain)}) @ ${width}px ${path}`,
          ).toBeTruthy();

          await expect(page.locator("main")).toBeVisible();
        });
      }
    });
  }
});
