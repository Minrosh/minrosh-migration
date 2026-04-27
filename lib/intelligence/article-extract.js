/**
 * Discover and fetch linked article pages from official listing hubs so intelligence
 * scans see body copy—not only nav/banners from the index HTML.
 */

function stripHtml(raw) {
  return String(raw || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBoilerplateTags(html) {
  return String(html || "")
    .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, " ");
}

/**
 * Prefer semantic main regions; fall back to de-chromed full page.
 * @param {string} html
 * @returns {string} plain text (not yet length-capped)
 */
export function extractReadableTextFromHtml(html) {
  const h = stripBoilerplateTags(html);
  const attempts = [
    /<main\b[^>]*property=["']mainContentOfPage["'][^>]*>([\s\S]*?)<\/main>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div\b[^>]*\bid=["']mw-content-text["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div\b[^>]*\bclass=["'][^"']*\bfield--name-body\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div\b[^>]*\bclass=["'][^"']*\bprose\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];
  for (const re of attempts) {
    const m = h.match(re);
    if (m && m[1] && m[1].replace(/<[^>]+>/g, "").trim().length > 120) {
      return stripHtml(m[1]);
    }
  }
  return stripHtml(h);
}

function normalizeHostname(host) {
  return String(host || "")
    .replace(/^www\./i, "")
    .toLowerCase();
}

export function hostsCompatible(listingUrlStr, candidateUrlStr) {
  try {
    const a = new URL(listingUrlStr).hostname;
    const b = new URL(candidateUrlStr).hostname;
    const na = normalizeHostname(a);
    const nb = normalizeHostname(b);
    if (na === nb) return true;
    if (na.endsWith("canada.ca") && nb.endsWith("canada.ca")) return true;
    if (na.endsWith("gov.uk") && nb.endsWith("gov.uk")) return true;
    if (na.endsWith("govt.nz") && nb.endsWith("govt.nz")) return true;
    return false;
  } catch {
    return false;
  }
}

const HREF_RE = /href\s*=\s*(["'])([^"']+)\1/gi;

/**
 * @param {string} html
 * @param {string} baseUrlStr
 * @returns {string[]}
 */
export function extractSameSiteLinks(html, baseUrlStr) {
  const seen = new Set();
  const out = [];
  let m;
  while ((m = HREF_RE.exec(html))) {
    const raw = String(m[2] || "").trim();
    if (!raw || raw.startsWith("#") || /^javascript:/i.test(raw) || /^mailto:/i.test(raw)) continue;
    try {
      const abs = new URL(raw, baseUrlStr).toString();
      const u = new URL(abs);
      u.hash = "";
      if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
        u.pathname = u.pathname.slice(0, -1);
      }
      if (!hostsCompatible(baseUrlStr, u.toString())) continue;
      const key = u.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    } catch {
      /* skip */
    }
  }
  return out;
}

const DEFAULT_HINTS = [
  "news",
  "media",
  "notice",
  "release",
  "press",
  "article",
  "story",
  "updates",
  "notifications",
  "government/news",
  "newsroom",
  "notices",
  "changes",
];

/** Hub noise, assets, licences, and search endpoints — not useful “official announcement” targets. */
export function isLowValueCrawlUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const h = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const full = String(urlStr).toLowerCase();
    if (/\.(css|js|mjs|map|json|xml|pdf|png|jpe?g|gif|svg|webp|ico|woff2?)(\?|$)/i.test(path)) return true;
    if (path.includes("/assets/") || path.includes("/static/")) return true;
    if (h.includes("nationalarchives.gov.uk")) return true;
    if (full.includes("open-government-licence") || full.includes("crown-copyright")) return true;
    if (/\/search\//i.test(path)) return true;
    if (path.includes("/help/cookies")) return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * @param {string[]} urls
 * @param {string} listingUrlStr
 * @param {string[]} [extraHints]
 */
export function filterLikelyArticleUrls(urls, listingUrlStr, extraHints = []) {
  const listing = new URL(listingUrlStr);
  const hints = [...new Set([...DEFAULT_HINTS.map((h) => h.toLowerCase()), ...extraHints.map((h) => h.toLowerCase())])];
  const listingPath = listing.pathname.replace(/\/$/, "") || "/";

  return urls.filter((urlStr) => {
    try {
      const u = new URL(urlStr);
      if (isLowValueCrawlUrl(urlStr)) return false;
      const path = u.pathname.toLowerCase();
      if (path === listingPath) return false;
      if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|docx?)(\?|$)/i.test(path)) return false;
      if (hints.some((h) => path.includes(h))) return true;
      const depth = path.split("/").filter(Boolean).length;
      return depth >= 4;
    } catch {
      return false;
    }
  });
}

/**
 * @param {string} url
 * @param {{ signal?: AbortSignal, userAgent?: string }} [opts]
 */
export async function fetchHtml(url, opts = {}) {
  const response = await fetch(url, {
    signal: opts.signal,
    headers: { "User-Agent": opts.userAgent || "MinRosh-IntelligenceBot/1.0 (+official-monitor)" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`http_${response.status}`);
  return response.text();
}
