import { test, expect } from "@playwright/test";

const EXTRA_PATHS = ["/global-pathways", "/thank-you", "/maintenance", "/newsletter/unsubscribe"];

async function publicPaths(page) {
  const response = await page.request.get("/sitemap.xml");
  const xml = await response.text();
  const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname || "/";
  });
  return [...new Set([...fromSitemap, ...EXTRA_PATHS])];
}

const WIDTHS = [390, 768, 1440];

for (const width of WIDTHS) {
  test(`public visual regression ${width}px`, async ({ page }) => {
    test.setTimeout(900_000);
    await page.setViewportSize({ width, height: 900 });
    const paths = await publicPaths(page);
    const problems = [];

    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 90_000 });
      const status = response?.status() ?? 0;
      if (status >= 400) {
        problems.push(`${path} HTTP ${status}`);
        continue;
      }

      const probe = await page.evaluate(() => {
        const root = document.documentElement;
        const title = document.title;
        const h1s = [...document.querySelectorAll("h1")].filter((el) => {
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return cs.display !== "none" && cs.visibility !== "hidden" && rect.height > 0;
        });
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
        const header = document.querySelector("header");
        return {
          title,
          overflow: root.scrollWidth > window.innerWidth + 2,
          h1Count: h1s.length,
          canonical,
          hasHeader: Boolean(header),
        };
      });

      if (probe.overflow) problems.push(`${path} horizontal overflow`);
      if (/MinRosh Migration\s*\|\s*MinRosh Migration/i.test(probe.title)) {
        problems.push(`${path} doubled title: ${probe.title}`);
      }
      if (probe.h1Count !== 1) problems.push(`${path} visible h1 count ${probe.h1Count}`);
      if (path !== "/maintenance" && !probe.hasHeader) problems.push(`${path} missing header`);
      if (path !== "/maintenance" && path !== "/thank-you" && !probe.canonical) {
        problems.push(`${path} missing canonical`);
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  });
}
