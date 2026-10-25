import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { metadata } from "../app/upload/layout.js";

const root = process.cwd();

const pagesThatDelegateFaqSchema = [
  "app/skilled-migration/page.js",
  "app/student-visa-australia/page.js",
  "app/partner-visa-australia/page.js",
  "app/employer-sponsored-visas/page.js",
  "app/visitor-visas/page.js",
  "app/migration-sri-lanka-to-australia/page.js",
  "app/education-consultation/page.js",
  "app/destinations/[slug]/[section]/page.js",
];

describe("private upload metadata", () => {
  it("keeps the token out of the canonical and social URL", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates.canonical).toBe("/upload");
    expect(metadata.openGraph.url).toBe("https://minroshmigration.com.au/upload");
    expect(metadata.openGraph.title).toBe("Private document link | MinRosh Migration");
    expect(metadata.openGraph.description).not.toMatch(/Explore general Australian migration information/);
    expect(JSON.stringify(metadata)).not.toMatch(/example-token|\[token\]/);
  });

  it("does not send a tokenised upload path to analytics", () => {
    const source = fs.readFileSync(path.join(root, "components/google-analytics.jsx"), "utf8");
    expect(source).toContain("pagePath.indexOf('/upload/') === 0");
    expect(source).toContain("page_path: '/upload'");
  });
});

describe("FAQPage is emitted once", () => {
  it("leaves FAQ schema to ContentPage when the page already passes faq content", () => {
    const contentPage = fs.readFileSync(path.join(root, "components/content-page.js"), "utf8");
    expect(contentPage).toContain("faqJsonLd(faq)");

    for (const relativePath of pagesThatDelegateFaqSchema) {
      const source = fs.readFileSync(path.join(root, relativePath), "utf8");
      expect(source, relativePath).not.toContain("faqJsonLd");
      expect(source, relativePath).toMatch(/faq=\{/);
    }
  });
});
