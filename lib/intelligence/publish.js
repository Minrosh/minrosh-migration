import {
  readNewsList,
  writeNewsList,
  withNewsMutation,
  makeUniqueNewsSlug,
  newNewsItemId,
  NEWS_PUBLIC_BASE,
} from "@/lib/news-store";
import { pickOfficialAnnouncementUrl } from "@/lib/intelligence/official-announcement-url";
import { extractPublicNewsBody, sanitizePublishedNewsTitle } from "@/lib/intelligence/public-news-copy";

function countryLabel(code) {
  const normalized = String(code || "").toUpperCase();
  if (normalized === "AU") return "Australia";
  if (normalized === "UK") return "United Kingdom";
  if (normalized === "NZ") return "New Zealand";
  if (normalized === "CA") return "Canada";
  return normalized || "Unknown";
}

function truncateBody(text, max = 48_000) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 20)}\n\n… (truncated)`;
}

export function publishDraftToNewsStore(draft) {
  return withNewsMutation(() => {
    const entries = readNewsList();
    const existing = entries.find((item) => item.intelligenceDraftId === draft.id);
    if (existing) return existing;

    const used = new Set(entries.map((e) => String(e.slug || "").trim()).filter(Boolean));
    const titleBase = sanitizePublishedNewsTitle(draft);
    const slug = makeUniqueNewsSlug(titleBase, used);
    const officialUrl = pickOfficialAnnouncementUrl(draft);
    const body = truncateBody(extractPublicNewsBody(draft));

    const row = {
      id: newNewsItemId(),
      slug,
      date: new Date().toISOString().slice(0, 10),
      country: countryLabel(draft.country),
      source: draft.sourceName || "Official source",
      sourceUrl: officialUrl || String(draft.sourceUrl || "").trim(),
      href: `${NEWS_PUBLIC_BASE}/${slug}`,
      title: titleBase,
      summary: String(draft.seoDescription || draft.summary || "").trim(),
      body,
      intelligenceDraftId: draft.id,
    };
    const next = [row, ...entries].slice(0, 300);
    writeNewsList(next);
    return row;
  });
}
