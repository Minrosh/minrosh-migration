const SITE = "https://minroshmigration.com.au";

export default function robots() {
  return {
    host: SITE,
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/reviews", "/api/stats"],
        disallow: ["/admin", "/api", "/upload"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
