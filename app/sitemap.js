import destinations from "../data/destinations.json";
import {
  buildPublicSitemapRoutes,
  SITEMAP_PRIORITIES,
  sitemapUrlForPath,
} from "../lib/public-indexable-routes";
import { getNewsData } from "../lib/news-data";
import { NEWS_PUBLIC_BASE } from "../lib/news-store";

/** Refresh sitemap frequently so deploy/content updates are reflected sooner. */
export const revalidate = 300;

function safeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function sitemap() {
  const routes = buildPublicSitemapRoutes(destinations);

  const staticEntries = routes.map((route) => ({
    url: sitemapUrlForPath(route),
    lastModified: new Date(),
    changeFrequency: route.includes("guide") ? "monthly" : "weekly",
    priority: SITEMAP_PRIORITIES[route] || 0.8,
  }));

  const newsEntries = getNewsData()
    .filter((n) => n.slug)
    .map((n) => ({
      url: sitemapUrlForPath(`${NEWS_PUBLIC_BASE}/${n.slug}`),
      lastModified: safeDate(n.updatedAt) || safeDate(n.date) || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticEntries, ...newsEntries];
}
