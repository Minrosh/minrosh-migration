const SITE = "https://minroshmigration.com.au";

export default function robots() {
  return {
    host: SITE,
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
