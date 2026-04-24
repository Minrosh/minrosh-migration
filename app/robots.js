const SITE = "https://minroshmigration.com.au";

export default function robots() {
  return {
    host: SITE,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/upload"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
