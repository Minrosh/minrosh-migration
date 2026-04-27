import { summarizeBody } from "./store";

/**
 * Structured audit trail of URLs and times used when building an intelligence draft.
 * @param {{ id?: string, url?: string, name?: string }} source
 * @param {{ articleUrls?: string[], contentHash?: string }} meta
 */
export function buildIntelligenceProvenance(source, meta = {}) {
  const now = new Date().toISOString();
  const sourceId = String(source?.id || "").trim();
  const hub = String(source?.url || "").trim();
  const contentHash = String(meta.contentHash || "").trim();
  const out = [];
  if (hub) {
    out.push({
      kind: "official_hub",
      url: hub,
      recordedAt: now,
      sourceId,
      contentHash: contentHash || null,
    });
  }
  const articleUrls = Array.isArray(meta.articleUrls) ? meta.articleUrls : [];
  for (const u of articleUrls.slice(0, 50)) {
    const url = String(u || "").trim();
    if (!url) continue;
    out.push({
      kind: "official_article",
      url,
      recordedAt: now,
      sourceId,
      contentHash: null,
    });
  }
  return out;
}

/**
 * @param {Array<{ url?: string, quote?: string }>} citations
 * @param {string} sourceId
 */
export function provenanceFromGeminiCitations(citations, sourceId = "") {
  const now = new Date().toISOString();
  const sid = String(sourceId || "").trim();
  const out = [];
  if (!Array.isArray(citations)) return out;
  for (const c of citations.slice(0, 15)) {
    const url = String(c?.url || "").trim();
    if (!url) continue;
    out.push({
      kind: "model_citation",
      url,
      recordedAt: now,
      sourceId: sid,
      quoteExcerpt: summarizeBody(String(c?.quote || ""), 200),
    });
  }
  return out;
}
