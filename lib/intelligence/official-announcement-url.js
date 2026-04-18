import { isLowValueCrawlUrl } from "./article-extract";

/**
 * Best URL for “Open official announcement” on public news — skips assets, licence pages, search, etc.
 */
export function pickOfficialAnnouncementUrl(draft) {
  const hub = String(draft?.sourceUrl || "").trim();
  const urls = draft?.grounding?.articleUrls;
  if (Array.isArray(urls)) {
    for (const u of urls) {
      const t = String(u || "").trim();
      if (!/^https?:\/\//i.test(t)) continue;
      if (isLowValueCrawlUrl(t)) continue;
      return t;
    }
  }
  if (hub && !isLowValueCrawlUrl(hub)) return hub;
  return hub;
}
