import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3120";
const OUT_DIR = path.join("reports/visual-audit/screenshots/final-qa");
const SAMPLE = new Set([
  "/",
  "/skilled-migration",
  "/education-consultation",
  "/destinations/australia",
  "/destinations/united-kingdom/about",
  "/assessment",
  "/contact",
  "/book-information-session",
  "/tools/pr-pathway-explorer",
  "/about",
  "/disclaimer",
  "/immigration-news",
  "/visa-services",
  "/global-pathways",
]);

function pathnameOf(loc) {
  const url = new URL(loc);
  return url.pathname || "/";
}

const xmlRes = await fetch(`${BASE}/sitemap.xml`);
const xml = await xmlRes.text();
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => pathnameOf(m[1]));
const lastmodCount = (xml.match(/<lastmod>/g) || []).length;
const extras = [
  "/global-pathways",
  "/thank-you",
  "/maintenance",
  "/newsletter/unsubscribe",
  "/book-consultation",
  "/this-route-should-404-qa",
];
const routes = [...new Set([...locs, ...extras])];
const widths = [390, 768, 1440];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const rows = [];
const linkSet = new Set();

for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of routes) {
    const consoleErrors = [];
    const failed = [];
    const onConsole = (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 180));
    };
    const onResponse = (res) => {
      if (res.status() >= 400) failed.push({ status: res.status(), url: res.url().slice(0, 180) });
    };
    page.on("console", onConsole);
    page.on("response", onResponse);
    let status = 0;
    try {
      const res = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
      status = res?.status() ?? 0;
      await page.waitForTimeout(250);
    } catch (error) {
      rows.push({ width, route, status: 0, error: String(error.message || error).slice(0, 180) });
      page.off("console", onConsole);
      page.off("response", onResponse);
      continue;
    }
    const probe = await page.evaluate(() => {
      const header = document.querySelector("header");
      const h1s = [...document.querySelectorAll("h1")].filter((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return cs.visibility !== "hidden" && cs.display !== "none" && rect.height > 0;
      });
      const h1 = h1s[0];
      const hr = header?.getBoundingClientRect();
      const r = h1?.getBoundingClientRect();
      const headerPos = header ? getComputedStyle(header).position : "";
      const imgs = [...document.querySelectorAll("img")].filter((img) => img.getBoundingClientRect().height > 8 && !img.alt);
      const buttons = [...document.querySelectorAll("a, button")].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.height < 44 && rect.width < 44;
      }).length;
      return {
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
        h1Count: h1s.length,
        h1: h1 ? h1.innerText.replace(/\s+/g, " ").trim().slice(0, 90) : "",
        h1Size: h1 ? Math.round(parseFloat(getComputedStyle(h1).fontSize)) : 0,
        headerH: hr ? Math.round(hr.height) : 0,
        headerPos,
        covered: Boolean(header && h1 && headerPos === "fixed" && r.top < hr.bottom - 2),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        missingAlt: imgs.length,
        tinyControls: buttons,
        hasHeader: Boolean(header),
        hasFooter: Boolean(document.querySelector("footer")),
      };
    });
    if (width === 1440 && status === 200) {
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") || ""),
      );
      for (const href of hrefs) {
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
        try {
          const url = new URL(href, location.origin);
          if (url.origin === location.origin) linkSet.add(url.pathname);
        } catch {
          /* ignore malformed hrefs */
        }
      }
    }
    const doubled = /MinRosh Migration\s*\|\s*MinRosh Migration/i.test(probe.title);
    const problem =
      status >= 400 ||
      probe.overflow ||
      probe.covered ||
      doubled ||
      (status === 200 && route !== "/this-route-should-404-qa" && probe.h1Count !== 1);
    if (SAMPLE.has(route) || problem) {
      const dir = path.join(OUT_DIR, `${width}x900`);
      fs.mkdirSync(dir, { recursive: true });
      const slug = route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "").slice(0, 80);
      await page.screenshot({ path: path.join(dir, `${slug}.png`) }).catch(() => {});
    }
    rows.push({
      width,
      route,
      status,
      doubled,
      consoleErrors: consoleErrors.slice(0, 4),
      failed: failed.slice(0, 6),
      ...probe,
    });
    page.off("console", onConsole);
    page.off("response", onResponse);
  }
}

const known = new Set(routes);
const unchecked = [...linkSet].filter((p) => !known.has(p) && !p.startsWith("/admin") && !p.startsWith("/api") && !p.startsWith("/upload"));
const linkChecks = [];
for (const p of unchecked.slice(0, 80)) {
  const res = await fetch(BASE + p, { redirect: "manual" });
  linkChecks.push({ path: p, status: res.status, location: res.headers.get("location") || "" });
}

const robots = await (await fetch(`${BASE}/robots.txt`)).text();
fs.writeFileSync(
  "reports/visual-audit/final-qa-crawl.json",
  JSON.stringify(
    {
      base: BASE,
      sitemapStatus: xmlRes.status,
      sitemapUrls: locs.length,
      lastmodCount,
      routeCount: routes.length,
      linkChecks,
      robots: robots.slice(0, 1200),
      rows,
    },
    null,
    2,
  ),
);
await browser.close();
const bad = rows.filter(
  (r) => r.status >= 400 || r.overflow || r.covered || r.doubled || (r.status === 200 && r.h1Count !== 1),
);
console.log(
  JSON.stringify(
    {
      routes: routes.length,
      sitemapUrls: locs.length,
      lastmodCount,
      measurements: rows.length,
      bad: bad.length,
      badSample: bad.slice(0, 25).map((r) => ({
        w: r.width,
        route: r.route,
        status: r.status,
        h1: r.h1Count,
        overflow: r.overflow,
        covered: r.covered,
        doubled: r.doubled,
      })),
    },
    null,
    2,
  ),
);
