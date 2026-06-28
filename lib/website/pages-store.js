import { randomUUID } from "node:crypto";
import {
  getWebsitePagesFile,
  getWebsitePagesSeed,
} from "@/lib/website/cms-data-paths";
import { validatePageSeo, validateWebsiteSections } from "@/lib/website/block-schemas";
import { appendWebsiteVersion } from "@/lib/website/version-store";
import {
  readWebsiteStore,
  withWebsiteStoreMutation,
  writeWebsiteStore,
} from "@/lib/website/website-store";
import { WEBSITE_PAGE_REGISTRY } from "@/lib/website/slug-utils";

const EMPTY_STORE = { schemaVersion: 1, pages: [] };

function validatePagesStore(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Store must be an object" };
  }
  const schemaVersion = Number(raw.schemaVersion) || 0;
  if (schemaVersion !== 1) {
    return { ok: false, error: "Unsupported schemaVersion" };
  }
  const pages = Array.isArray(raw.pages) ? raw.pages : [];
  return { ok: true, data: { schemaVersion: 1, pages } };
}

function normalizePage(page) {
  const slug = String(page?.slug || "").trim();
  const draft = page?.draft && typeof page.draft === "object" ? page.draft : {};
  const published = page?.published && typeof page.published === "object" ? page.published : {};
  return {
    id: String(page?.id || `page-${randomUUID()}`),
    slug,
    pageTitle: String(page?.pageTitle || slug || "Untitled").trim(),
    status: page?.status === "published" ? "published" : "draft",
    seo: validatePageSeo(page?.seo),
    draft: {
      sections: Array.isArray(draft.sections) ? draft.sections : [],
      updatedAt: draft.updatedAt || null,
      updatedBy: draft.updatedBy || null,
    },
    published: {
      sections: Array.isArray(published.sections) ? published.sections : [],
      publishedAt: published.publishedAt || null,
      publishedBy: published.publishedBy || null,
    },
  };
}

function readStoreInternal() {
  return readWebsiteStore(getWebsitePagesFile(), getWebsitePagesSeed(), validatePagesStore, EMPTY_STORE);
}

function dedupePagesBySlug(pages) {
  const map = new Map();
  for (const p of pages) {
    map.set(String(p.slug), p);
  }
  return [...map.values()];
}

export function readPagesStoreForAdmin() {
  return readStoreInternal();
}

export function listWebsitePagesForAdmin() {
  const result = readStoreInternal();
  if (!result.ok || !result.data) {
    return { ok: false, pages: [], error: result.error || "Could not read pages store" };
  }
  const bySlug = new Map(result.data.pages.map((p) => [String(p.slug), normalizePage(p)]));
  const pages = WEBSITE_PAGE_REGISTRY.map((reg) => {
    const existing = bySlug.get(reg.slug);
    if (existing) return existing;
    return normalizePage({
      id: `page-${reg.adminSlug}`,
      slug: reg.slug,
      pageTitle: reg.pageTitle,
      status: "draft",
      seo: {},
      draft: { sections: [], updatedAt: null, updatedBy: null },
      published: { sections: [], publishedAt: null, publishedBy: null },
    });
  });
  return { ok: true, pages, error: null };
}

/**
 * @param {string} slug — page path e.g. "/about"
 * @param {{ forPublic?: boolean }} [options]
 */
export function getPublishedPageBySlug(slug, options = {}) {
  const result = readStoreInternal();
  if (!result.ok || !result.data) {
    return options.forPublic ? null : null;
  }
  const page = result.data.pages.find((p) => String(p.slug) === String(slug));
  if (!page) return null;
  return normalizePage(page);
}

/**
 * @param {string} slug
 */
export function getWebsitePageBySlugForAdmin(slug) {
  const listed = listWebsitePagesForAdmin();
  if (!listed.ok) return { ok: false, page: null, error: listed.error };
  const page = listed.pages.find((p) => p.slug === slug);
  if (!page) return { ok: false, page: null, error: "Page not found" };
  return { ok: true, page, error: null };
}

/**
 * @param {string} slug
 * @param {{ sections: unknown[], seo?: unknown, pageTitle?: string, updatedBy?: string }} patch
 */
export function saveWebsitePageDraft(slug, patch) {
  return withWebsiteStoreMutation(getWebsitePagesFile(), () => {
    const result = readStoreInternal();
    const store = result.ok && result.data ? result.data : { ...EMPTY_STORE, pages: [] };
    const pages = [...store.pages];
    const idx = pages.findIndex((p) => String(p.slug) === String(slug));
    const reg = WEBSITE_PAGE_REGISTRY.find((r) => r.slug === slug);
    const now = new Date().toISOString();
    const sections = validateWebsiteSections(patch.sections);
    const base =
      idx >= 0
        ? normalizePage(pages[idx])
        : normalizePage({
            slug,
            pageTitle: reg?.pageTitle || slug,
            status: "draft",
            seo: {},
            draft: { sections: [], updatedAt: null, updatedBy: null },
            published: { sections: [], publishedAt: null, publishedBy: null },
          });
    const next = {
      ...base,
      pageTitle: patch.pageTitle != null ? String(patch.pageTitle).trim() : base.pageTitle,
      status: "draft",
      seo: patch.seo != null ? validatePageSeo(patch.seo) : base.seo,
      draft: {
        sections,
        updatedAt: now,
        updatedBy: patch.updatedBy || null,
      },
    };
    if (idx >= 0) pages[idx] = next;
    else pages.push(next);
    writeWebsiteStore(getWebsitePagesFile(), { schemaVersion: 1, pages: dedupePagesBySlug(pages) });
    return next;
  });
}

/**
 * Publish current draft → published and append version snapshot.
 * @param {string} slug
 * @param {{ publishedBy?: string }} meta
 */
export function publishWebsitePage(slug, meta = {}) {
  return withWebsiteStoreMutation(getWebsitePagesFile(), () => {
    const listed = listWebsitePagesForAdmin();
    if (!listed.ok) throw new Error(listed.error || "Could not read pages");
    const current = listed.pages.find((p) => p.slug === slug);
    if (!current) throw new Error("Page not found");
    const sections = validateWebsiteSections(current.draft?.sections || []);
    if (sections.length === 0) {
      throw new Error("Cannot publish: draft has no sections");
    }
    const now = new Date().toISOString();
    const publishedBy = meta.publishedBy || null;
    const next = {
      ...current,
      status: "published",
      seo: validatePageSeo(current.seo),
      published: {
        sections,
        publishedAt: now,
        publishedBy,
      },
    };
    const result = readStoreInternal();
    const store = result.ok && result.data ? result.data : { ...EMPTY_STORE, pages: [] };
    const pages = [...store.pages];
    const idx = pages.findIndex((p) => String(p.slug) === String(slug));
    if (idx >= 0) pages[idx] = next;
    else pages.push(next);
    writeWebsiteStore(getWebsitePagesFile(), { schemaVersion: 1, pages: dedupePagesBySlug(pages) });
    appendWebsiteVersion(slug, JSON.parse(JSON.stringify(next)), { publishedBy });
    return next;
  });
}

/**
 * Restore a version snapshot into draft or published.
 * @param {string} slug
 * @param {object} snapshot
 * @param {{ target?: 'draft' | 'published', updatedBy?: string }} options
 */
export function applyWebsitePageSnapshot(slug, snapshot, options = {}) {
  const target = options.target === "published" ? "published" : "draft";
  return withWebsiteStoreMutation(getWebsitePagesFile(), () => {
    const normalized = normalizePage(snapshot);
    if (normalized.slug !== slug) throw new Error("Version slug mismatch");
    const sections =
      target === "published"
        ? validateWebsiteSections(normalized.published?.sections || normalized.draft?.sections || [])
        : validateWebsiteSections(normalized.draft?.sections || normalized.published?.sections || []);
    const now = new Date().toISOString();
    const result = readStoreInternal();
    const store = result.ok && result.data ? result.data : { ...EMPTY_STORE, pages: [] };
    const pages = [...store.pages];
    const idx = pages.findIndex((p) => String(p.slug) === String(slug));
    const base = idx >= 0 ? normalizePage(pages[idx]) : normalized;
    const next = {
      ...base,
      pageTitle: normalized.pageTitle || base.pageTitle,
      seo: validatePageSeo(normalized.seo),
      status: target === "published" ? "published" : base.status,
    };
    if (target === "draft") {
      next.draft = {
        sections,
        updatedAt: now,
        updatedBy: options.updatedBy || null,
      };
    } else {
      next.published = {
        sections,
        publishedAt: now,
        publishedBy: options.updatedBy || null,
      };
      next.status = "published";
    }
    if (idx >= 0) pages[idx] = next;
    else pages.push(next);
    writeWebsiteStore(getWebsitePagesFile(), { schemaVersion: 1, pages: dedupePagesBySlug(pages) });
    return next;
  });
}

/**
 * Clear published content (emergency unpublish for a page).
 * @param {string} slug
 */
export function unpublishWebsitePage(slug) {
  return withWebsiteStoreMutation(getWebsitePagesFile(), () => {
    const result = readStoreInternal();
    if (!result.ok || !result.data) throw new Error("Could not read pages store");
    const pages = [...result.data.pages];
    const idx = pages.findIndex((p) => String(p.slug) === String(slug));
    if (idx < 0) throw new Error("Page not found");
    const next = normalizePage(pages[idx]);
    next.status = "draft";
    next.published = { sections: [], publishedAt: null, publishedBy: null };
    pages[idx] = next;
    writeWebsiteStore(getWebsitePagesFile(), { schemaVersion: 1, pages: dedupePagesBySlug(pages) });
    return next;
  });
}
