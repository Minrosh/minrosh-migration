import destinations from "../data/destinations.json";
import {
  buildPublicSitemapRoutes,
  newsContentLastModified,
  sitemapUrlForPath,
  staticSitemapEntry,
} from "../lib/public-indexable-routes";
import { getNewsData } from "../lib/news-data";
import { NEWS_PUBLIC_BASE } from "../lib/news-store";

/** Refresh sitemap frequently so deploy/content updates are reflected sooner. */
export const revalidate = 300;

export default function sitemap() {
  const routes = buildPublicSitemapRoutes(destinations);

  const staticEntries = routes.map((route) => staticSitemapEntry(route));

  const newsEntries = getNewsData()
    .filter((n) => n.slug)
    .map((n) => {
      const lastModified = newsContentLastModified(n);
      return {
        url: sitemapUrlForPath(`${NEWS_PUBLIC_BASE}/${n.slug}`),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

  return [...staticEntries, ...newsEntries];
}
