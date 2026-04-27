/**
 * Official hubs monitored for policy/news changes. Each entry may include
 * `articlePathHints` to prefer in-site article URLs when crawling past the hub page.
 * Set `crawlArticles: false` to hash hub-only text (not recommended for news indexes).
 */
export const OFFICIAL_INTELLIGENCE_SOURCES = [
  {
    id: "au-homeaffairs-news",
    country: "AU",
    name: "Australia Department of Home Affairs",
    url: "https://immi.homeaffairs.gov.au/news-media",
    tags: ["australia", "home-affairs", "policy-update"],
    crawlArticles: { maxArticles: 14 },
    articlePathHints: ["news-media", "news-", "/news/", "media", "changes", "updates"],
  },
  {
    id: "uk-gov-immigration",
    country: "UK",
    name: "GOV.UK Visas and Immigration",
    url: "https://www.gov.uk/browse/visas-immigration",
    tags: ["united-kingdom", "gov-uk", "policy-update"],
    crawlArticles: { maxArticles: 12 },
    articlePathHints: [
      "government/news",
      "/guidance/",
      "/government/publications",
      "/visa",
      "/visas-immigration",
      "immigration-rules",
      "policy",
    ],
  },
  {
    id: "nz-immigration-news",
    country: "NZ",
    name: "Immigration New Zealand News Centre",
    url: "https://www.immigration.govt.nz/about-us/media-centre/news-notifications",
    tags: ["new-zealand", "inz", "policy-update"],
    crawlArticles: { maxArticles: 14 },
    articlePathHints: [
      "news",
      "media-centre",
      "notifications",
      "operational",
      "changes",
      "updates",
      "about-us",
    ],
  },
  {
    id: "ca-ircc-news",
    country: "CA",
    name: "IRCC Newsroom",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/news.html",
    tags: ["canada", "ircc", "policy-update"],
    crawlArticles: { maxArticles: 14 },
    articlePathHints: [
      "/news/",
      "newsroom",
      "campaigns",
      "articles",
      "immigration-refugees-citizenship",
      "services",
      "corporate",
    ],
  },
];
