import destinations from "../data/destinations.json";
import {
  buildPublicSitemapRoutes,
  SITEMAP_PRIORITIES,
  sitemapUrlForPath,
} from "../lib/public-indexable-routes";
import { getNewsData } from "../lib/news-data";
import { NEWS_PUBLIC_BASE } from "../lib/news-store";

/** Regenerate sitemap periodically so `lastModified` advances after content/deploys (crawl hint). */
export const revalidate = 21600;

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
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticEntries, ...newsEntries];
}
