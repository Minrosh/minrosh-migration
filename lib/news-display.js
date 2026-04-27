/** Client-safe helpers (no Node `fs` — safe for `"use client"` components). */

export const NEWS_PUBLIC_BASE = "/immigration-news";

function slugifyTitleClient(title, max = 80) {
  const s = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return s || "news-item";
}

export function articleSlugForNewsItem(item, index = 0) {
  if (item?.slug && String(item.slug).trim()) return String(item.slug).trim();
  return slugifyTitleClient(`${item?.date || ""}-${item?.title || "update"}`) || `item-${index}`;
}

/**
 * URL for “Read MinRosh guide”: canonical detail page when `slug` is set, else sensible fallbacks.
 */
export function minRoshGuideHref(item, index = 0) {
  const slug = item?.slug && String(item.slug).trim();
  if (slug) return `${NEWS_PUBLIC_BASE}/${slug}`;
  const h = String(item?.href || "").trim();
  if (h.startsWith(`${NEWS_PUBLIC_BASE}/`)) return h;
  if (h && /^https?:\/\//i.test(h)) return h;
  if (h && h.startsWith("/") && h !== "/updates") return h;
  return `${NEWS_PUBLIC_BASE}/${articleSlugForNewsItem(item, index)}`;
}
