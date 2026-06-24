import { test, expect } from "@playwright/test";

/** Priority public routes for mobile layout (local CI standalone server). */
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
  "/assessment",
  "/contact",
];

const WIDTHS = [320, 360, 390, 414, 430, 768, 1024];

async function waitForPublicMain(page) {
  const overlay = page.locator(".loading-screen--route-boundary").first();
  if ((await overlay.count()) > 0) {
    await overlay.waitFor({ state: "detached", timeout: 45_000 }).catch(() => {});
  }
  await page.locator("main.portal-main--immersive#main-content").waitFor({
    state: "visible",
    timeout: 45_000,
  });
}

for (const width of WIDTHS) {
  test.describe(`mobile layout local ${width}px`, () => {
    for (const path of PATHS) {
      test(`${path}`, async ({ page }) => {
        await page.setViewportSize({ width, height: Math.max(900, Math.round(width * 2)) });
        const res = await page.goto(path, {
          waitUntil: "domcontentloaded",
          timeout: 90_000,
        });
        expect(res?.ok(), `HTTP ${res?.status()} for ${path}`).toBeTruthy();
        await waitForPublicMain(page);

        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const cw = root.clientWidth;
          const docGap = Math.max(0, root.scrollWidth - cw);
          const bodyGap = body ? Math.max(0, body.scrollWidth - cw) : 0;
          const portalMain = document.querySelector("#main-content");
          let mainW = 0;
          if (portalMain) {
            mainW = portalMain.getBoundingClientRect().width;
          }
          const bodyOverflowHidden = body ? window.getComputedStyle(body).overflowX === "hidden" : false;
          return { docGap, bodyGap, cw, mainW, bodyOverflowHidden };
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
            `#main-content wider than viewport (${overflow.mainW} vs ${overflow.cw}) @ ${width}px ${path}`,
          ).toBeLessThanOrEqual(overflow.cw + 2);
        }

        const headerBlocksMain = await page.evaluate(() => {
          const header = document.querySelector("header.site-header");
          const main = document.querySelector("#main-content");
          if (!header || !main) return { ok: true, reason: "missing-header-or-main" };
          const hr = header.getBoundingClientRect();
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

        if (path === "/contact" || path === "/assessment") {
          const submit = page.locator('form button[type="submit"], form input[type="submit"]').first();
          if ((await submit.count()) > 0) {
            await submit.scrollIntoViewIfNeeded();
            const formClearance = await page.evaluate(() => {
              const tabBar = document.querySelector(".site-mobile-tab-bar");
              const stickyCta = document.querySelector(".mobile-sticky-quiz-cta-shell");
              const submitEl = document.querySelector('form button[type="submit"], form input[type="submit"]');
              if (!submitEl) return { ok: true, reason: "no-submit" };
              const sr = submitEl.getBoundingClientRect();
              const vh = window.innerHeight;
              const tabTop = tabBar ? tabBar.getBoundingClientRect().top : vh;
              const ctaTop =
                stickyCta && window.getComputedStyle(stickyCta).display !== "none"
                  ? stickyCta.getBoundingClientRect().top
                  : vh;
              const obstructionTop = Math.min(tabTop, ctaTop);
              const ok = sr.top >= 8 && sr.bottom <= obstructionTop - 8;
              return { ok, srTop: sr.top, srBottom: sr.bottom, obstructionTop };
            });
            if (width <= 430) {
              expect(
                formClearance.ok,
                `submit not visible above mobile chrome (${JSON.stringify(formClearance)}) @ ${width}px`,
              ).toBeTruthy();
            }
          }
        }

        await expect(page.locator("#main-content")).toBeVisible();
      });
    }
  });
}
