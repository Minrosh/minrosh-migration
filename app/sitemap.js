import destinations from "../data/destinations.json";
import { DESTINATION_SECTION_IDS } from "../lib/destination-nav";

const destinationSectionRoutes = Object.keys(destinations).flatMap((slug) =>
  DESTINATION_SECTION_IDS.map((section) => `/destinations/${slug}/${section}`)
);

export default function sitemap() {
  const routes = [
    "/",
    "/skilled-migration",
    "/partner-visa-australia",
    "/student-visa-australia",
    "/employer-sponsored-visas",
    "/visitor-visas",
    "/book-consultation",
    "/assessment",
    "/contact",
    "/education-consultation",
    "/about",
    "/faq",
    "/updates",
    "/privacy-policy",
    "/disclaimer",
    "/complaints",
    "/terms-of-use",
    "/code-of-conduct",
    "/partner-visa-australia-guide",
    "/student-visa-australia-requirements",
    "/skilled-migration-australia-points-guide",
    "/destinations/australia",
    "/destinations/new-zealand",
    "/destinations/canada",
    "/destinations/united-kingdom",
    ...destinationSectionRoutes,
  ];

  const priorities = {
    "/": 1,
    "/book-consultation": 0.95,
    "/contact": 0.9,
    "/skilled-migration": 0.9,
    "/destinations/australia": 0.92,
    "/partner-visa-australia": 0.9,
    "/student-visa-australia": 0.9,
    "/education-consultation": 0.85,
    "/updates": 0.85,
  };

  return routes.map((route) => ({
    url: `https://minroshmigration.com.au${route === "/" ? "" : route}`,
    lastModified: new Date(),
    changeFrequency: route.includes("guide") ? "monthly" : "weekly",
    priority: priorities[route] || 0.8,
  }));
}
