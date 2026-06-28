#!/usr/bin/env node
/** Seed staging CMS published content (no app imports). */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const dataDir =
  process.env.WEBSITE_CMS_TEST_DATA_DIR ||
  path.join(process.cwd(), ".next/standalone/data-staging");

const PAGES = [
  { slug: "/about", pageTitle: "About", heading: "CMS About — Staging Verify 3a" },
  { slug: "/contact", pageTitle: "Contact", heading: "CMS Contact — Staging Verify 3b" },
  { slug: "/student-visa-australia", pageTitle: "Student Visa Australia", heading: "CMS Student Visa — Staging Verify 3c" },
  { slug: "/skilled-migration", pageTitle: "Skilled Migration", heading: "CMS Skilled Migration — Staging Verify 3d" },
  { slug: "/post-study-visa-australia", pageTitle: "Post-Study Visa Australia", heading: "CMS Post-Study Visa — Staging Verify 3e" },
  { slug: "/faq", pageTitle: "FAQ", heading: "CMS FAQ — Staging Verify 3f" },
];

const now = new Date().toISOString();

const pages = PAGES.map((page) => {
  const sections = [
    {
      id: `hero-${page.slug.replace(/\//g, "")}`,
      type: "hero",
      props: {
        eyebrow: "Website Manager",
        heading: page.heading,
        subheading: "Staging CMS verification block",
        primaryCta: { text: "Contact", href: "/contact" },
        secondaryCta: { text: "Assessment", href: "/assessment" },
      },
    },
    {
      id: `text-${page.slug.replace(/\//g, "")}`,
      type: "text",
      props: {
        heading: "Staging publish check",
        body: "This block was published from Website Manager for formal staging verification.",
      },
    },
  ];
  return {
    id: `page-${randomUUID()}`,
    slug: page.slug,
    pageTitle: page.pageTitle,
    status: "published",
    seo: {},
    draft: { sections, updatedAt: now, updatedBy: "staging-verify" },
    published: { sections, publishedAt: now, publishedBy: "staging-verify" },
  };
});

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "website-pages.json"), JSON.stringify({ schemaVersion: 1, pages }, null, 2));
console.log("Seeded", pages.length, "pages to", dataDir);
