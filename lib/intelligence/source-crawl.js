import {
  extractReadableTextFromHtml,
  extractSameSiteLinks,
  fetchHtml,
  filterLikelyArticleUrls,
  isLowValueCrawlUrl,
} from "./article-extract";

const DEFAULT_OPTS = {
  maxArticles: 12,
  maxBytesPerArticle: 48_000,
  totalBudgetMs: 42_000,
  delayMs: 220,
};

/**
 * @param {{ url: string, crawlArticles?: false | { maxArticles?: number }, articlePathHints?: string[] }} source
 * @param {string} listingHtml
 * @param {Partial<typeof DEFAULT_OPTS>} [opts]
 */
export async function aggregateOfficialSourceText(source, listingHtml, opts = {}) {
  const maxArticles = source.crawlArticles?.maxArticles ?? DEFAULT_OPTS.maxArticles;
  const crawlDisabled = source.crawlArticles === false;

  const listingText = extractReadableTextFromHtml(listingHtml);
  if (crawlDisabled) {
    const text = listingText;
    return {
      text,
      articleUrls: [],
      listingChars: listingText.length,
      aggregatedChars: text.length,
    };
  }

  const hints = Array.isArray(source.articlePathHints) ? source.articlePathHints : [];
  const baseUrl = source.url;
  const rawLinks = extractSameSiteLinks(listingHtml, baseUrl);
  let candidates = filterLikelyArticleUrls(rawLinks, baseUrl, hints);
  candidates = [...new Set(candidates)].sort((a, b) => b.length - a.length).slice(0, maxArticles);

  const chunks = [`[Listing hub]\n${listingText.slice(0, 14_000)}`];
  const fetchedUrls = [];
  const deadline = Date.now() + (opts.totalBudgetMs ?? DEFAULT_OPTS.totalBudgetMs);
  const perCap = opts.maxBytesPerArticle ?? DEFAULT_OPTS.maxBytesPerArticle;
  const delayMs = opts.delayMs ?? DEFAULT_OPTS.delayMs;
  const ua = opts.userAgent;

  for (const url of candidates) {
    if (Date.now() > deadline) break;
    const remaining = deadline - Date.now();
    if (remaining < 900) break;
    try {
      const controller = new AbortController();
      const timeoutMs = Math.min(14_000, remaining);
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const html = await fetchHtml(url, { signal: controller.signal, userAgent: ua });
      clearTimeout(timeout);
      const text = extractReadableTextFromHtml(html).slice(0, perCap);
      if (text.length > 200) {
        chunks.push(`[Article]\n${text}`);
        if (!isLowValueCrawlUrl(url)) fetchedUrls.push(url);
      }
    } catch {
      /* skip */
    }
    if (delayMs > 0 && Date.now() <= deadline) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  const aggregated = chunks.join("\n\n---\n\n");
  return {
    text: aggregated,
    articleUrls: fetchedUrls,
    listingChars: listingText.length,
    aggregatedChars: aggregated.length,
  };
}
