#!/usr/bin/env node
/**
 * Seed Website CMS draft content from existing JSON sources.
 * Draft only — does not publish. Safe to re-run (skips slugs that already have drafts).
 *
 * Usage: node scripts/migrate-website-cms-seed.mjs [--force]
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import seoPages from "../data/seo-pages.json" with { type: "json" };
import destinations from "../data/destinations.json" with { type: "json" };
import { websitePagesFile } from "../lib/admin/paths.js";

const force = process.argv.includes("--force");

const SERVICE_SLUG_MAP = {
  about: "/about",
  contact: "/contact",
  studentVisa: "/student-visa-australia",
  skilledMigration: "/skilled-migration",
  postStudyVisa: "/post-study-visa-australia",
  faqHub: "/faq",
};

function heroSection(heading, subheading, eyebrow = "") {
  return {
    id: `hero-${randomUUID().slice(0, 8)}`,
    type: "hero",
    props: {
      eyebrow,
      heading: String(heading || "").slice(0, 200),
      subheading: String(subheading || "").slice(0, 500),
      image: "",
      imageAlt: "",
      primaryCta: { text: "Contact", href: "/contact" },
      secondaryCta: { text: "Free Assessment", href: "/assessment" },
    },
  };
}

function textSection(section) {
  const paragraphs = [section.body, ...(section.bullets || [])].filter(Boolean);
  return {
    id: `text-${randomUUID().slice(0, 8)}`,
    type: "text",
    props: {
      heading: String(section.title || "").slice(0, 200),
      paragraphs: paragraphs.map((p) => String(p).slice(0, 4000)),
    },
  };
}

function buildDraftFromServicePage(slug, data, pageTitle) {
  const sections = [heroSection(data.headline || data.title, data.intro, pageTitle)];
  for (const section of data.sections || []) {
    sections.push(textSection(section));
  }
  return {
    id: `page-${randomUUID()}`,
    slug,
    pageTitle,
    status: "draft",
    seo: {
      title: data.metaTitle || "",
      description: data.metaDescription || "",
      canonical: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noindex: false,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
    },
    draft: {
      sections,
      updatedAt: new Date().toISOString(),
      updatedBy: "migrate-website-cms-seed",
    },
    published: { sections: [], publishedAt: null, publishedBy: null },
  };
}

function buildDestinationDraft(slug, data) {
  const pathSlug = `/destinations/${slug}`;
  const sections = [
    heroSection(data.headline || data.name, data.intro, `${data.name} hub`),
    ...(data.sections || []).map((s) => textSection(s)),
  ];
  return {
    id: `page-${randomUUID()}`,
    slug: pathSlug,
    pageTitle: `${data.name} hub`,
    status: "draft",
    seo: {
      title: data.metaTitle || "",
      description: data.metaDescription || "",
      canonical: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noindex: false,
      keywords: [data.name, "migration", "visa guidance"],
    },
    draft: {
      sections,
      updatedAt: new Date().toISOString(),
      updatedBy: "migrate-website-cms-seed",
    },
    published: { sections: [], publishedAt: null, publishedBy: null },
  };
}

function readStore() {
  try {
    if (!fs.existsSync(websitePagesFile)) return { schemaVersion: 1, pages: [] };
    return JSON.parse(fs.readFileSync(websitePagesFile, "utf8"));
  } catch {
    return { schemaVersion: 1, pages: [] };
  }
}

const store = readStore();
const pages = Array.isArray(store.pages) ? [...store.pages] : [];
const existing = new Set(pages.map((p) => p.slug));
let added = 0;

for (const [key, slug] of Object.entries(SERVICE_SLUG_MAP)) {
  const data = seoPages.servicePages?.[key];
  if (!data || (!force && existing.has(slug))) continue;
  const draft = buildDraftFromServicePage(slug, data, data.title || slug);
  const idx = pages.findIndex((p) => p.slug === slug);
  if (idx >= 0) pages[idx] = draft;
  else pages.push(draft);
  added += 1;
}

for (const [slug, data] of Object.entries(destinations)) {
  const pathSlug = `/destinations/${slug}`;
  if (!force && existing.has(pathSlug)) continue;
  const draft = buildDestinationDraft(slug, data);
  const idx = pages.findIndex((p) => p.slug === pathSlug);
  if (idx >= 0) pages[idx] = draft;
  else pages.push(draft);
  added += 1;
}

fs.mkdirSync(path.dirname(websitePagesFile), { recursive: true });
fs.writeFileSync(websitePagesFile, `${JSON.stringify({ schemaVersion: 1, pages }, null, 2)}\n`, "utf8");
console.log(`migrate-website-cms-seed: ${added} draft page(s) written to ${websitePagesFile}`);
console.log("Note: drafts only — public site unchanged until publish + CMS flag enabled.");
