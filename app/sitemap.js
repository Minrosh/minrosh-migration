import destinations from "../data/destinations.json";
import {
  buildPublicSitemapRoutes,
  SITEMAP_PRIORITIES,
  sitemapUrlForPath,
} from "../lib/public-indexable-routes";

export default function sitemap() {
  const routes = buildPublicSitemapRoutes(destinations);

  return routes.map((route) => ({
    url: sitemapUrlForPath(route),
    lastModified: new Date(),
    changeFrequency: route.includes("guide") ? "monthly" : "weekly",
    priority: SITEMAP_PRIORITIES[route] || 0.8,
  }));
}
