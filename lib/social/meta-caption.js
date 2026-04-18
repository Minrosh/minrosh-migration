/**
 * Meta-oriented caption builder: short first-line hook, body, 3–5 hashtags, engagement question.
 * @param {object} opts
 * @param {string} opts.headline
 * @param {string} [opts.summary]
 * @param {string} [opts.country] ISO-ish code (AU, UK, …)
 * @param {string} opts.readMoreHref Absolute or site-relative link shown in caption
 * @param {string} [opts.engagementQuestion] from env SOCIAL_CAPTION_ENGAGEMENT_QUESTION
 */

const HOOK_MAX = 125;

function compact(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!max) return clean;
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

function truncateGraphemes(s, max) {
  const arr = Array.from(String(s || ""));
  if (arr.length <= max) return String(s || "");
  return `${arr.slice(0, Math.max(0, max - 1)).join("")}…`;
}

export function countryDisplayName(country) {
  const c = String(country || "").toUpperCase();
  const map = {
    AU: "Australia",
    UK: "United Kingdom",
    NZ: "New Zealand",
    CA: "Canada",
  };
  return map[c] || (c ? c : "Global");
}

export function hashtagByCountry(country) {
  const c = String(country || "").toUpperCase();
  if (c === "AU") return "#AustraliaVisa";
  if (c === "UK") return "#UKVisa";
  if (c === "NZ") return "#NZVisa";
  if (c === "CA") return "#CanadaVisa";
  return "#VisaUpdate";
}

function defaultEngagementQuestion(country) {
  const fromEnv = String(process.env.SOCIAL_CAPTION_ENGAGEMENT_QUESTION || "").trim();
  if (fromEnv) return fromEnv;
  const place = countryDisplayName(country);
  return `Are you applying for a visa for ${place}? Let us know in the comments.`;
}

/**
 * Four targeted hashtags (within 3–5 guidance when combined with caption keywords).
 */
function hashtagBlock(country) {
  return [hashtagByCountry(country), "#ImmigrationUpdate", "#MinRosh", "#VisaNews"].join(" ");
}

/**
 * First block is the “visible without See more” hook (≤ HOOK_MAX graphemes).
 */
export function absolutizeSiteHref(href) {
  const h = String(href || "").trim() || "/updates";
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  const base = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (!base) return h;
  return h.startsWith("/") ? `${base}${h}` : `${base}/${h}`;
}

export function buildMetaCaption({ headline, summary, country, readMoreHref, engagementQuestion }) {
  const h = compact(headline, 500);
  const place = countryDisplayName(country);
  const prefix = `Visa update — ${place}: `;
  const room = Math.max(24, HOOK_MAX - Array.from(prefix).length);
  const hookCore = truncateGraphemes(h, room);
  const hook = truncateGraphemes(`${prefix}${hookCore}`, HOOK_MAX);

  const summaryBlock = compact(summary, 320);
  const link = absolutizeSiteHref(readMoreHref);
  const readLine = `Read more: ${link}`;
  const tags = hashtagBlock(country);
  const question = engagementQuestion || defaultEngagementQuestion(country);

  const chunks = [hook];
  if (summaryBlock) chunks.push(summaryBlock);
  chunks.push(readLine, tags, question);
  return chunks.join("\n\n");
}

export function captionStats(caption) {
  const text = String(caption || "");
  const lines = text.split(/\r?\n/);
  const firstLine = lines[0] || "";
  const hookLen = Array.from(firstLine).length;
  const hashtagCount = (text.match(/#[A-Za-z0-9_]+/g) || []).length;
  return {
    totalLen: Array.from(text).length,
    hookLen,
    hookWithinLimit: hookLen <= HOOK_MAX,
    hashtagCount,
    lineCount: lines.length,
  };
}
