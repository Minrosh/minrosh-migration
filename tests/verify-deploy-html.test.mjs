import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Replicate extractCssLinks from verify-deploy-html.mjs
function extractCssLinks(html) {
  const re = /\/_next\/static\/css\/[a-f0-9]+\.css/gi;
  const seen = new Set();
  const links = [];
  for (const m of html.matchAll(re)) {
    const link = m[0].toLowerCase();
    if (!seen.has(link)) {
      seen.add(link);
      links.push(link);
    }
  }
  return links.sort();
}

describe("verify-deploy-html helpers", () => {
  it("extractCssLinks dedupes and sorts", () => {
    const html = `
      <link href="/_next/static/css/abc123.css" />
      <link href="/_next/static/css/def456.css" />
      <link href="/_next/static/css/abc123.css" />
    `;
    expect(extractCssLinks(html)).toEqual([
      "/_next/static/css/abc123.css",
      "/_next/static/css/def456.css",
    ]);
  });

  it("homepage subset of build css is valid (not all build files appear on /)", () => {
    const buildFiles = ["a.css", "b.css", "c.css", "unused-route.css"];
    const homepageHtml = `
      <link href="/_next/static/css/a.css" />
      <link href="/_next/static/css/b.css" />
      <link href="/_next/static/css/c.css" />
    `;
    const homepageCss = extractCssLinks(homepageHtml).map((l) => path.basename(l));
    const buildSet = new Set(buildFiles);
    const allInBuild = homepageCss.every((f) => buildSet.has(f));
    expect(allInBuild).toBe(true);
    expect(homepageCss.length).toBeLessThan(buildFiles.length);
  });
});
