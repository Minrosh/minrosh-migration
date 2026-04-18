import { OFFICIAL_INTELLIGENCE_SOURCES } from "./sources";
import {
  appendIntelligenceEvent,
  createPendingDraft,
  hashContent,
  pushAdminAlert,
  summarizeBody,
  upsertSourceSnapshot,
} from "./store";
import { notifyAdminDraftReady } from "./notifications";
import { extractReadableTextFromHtml } from "./article-extract";
import { aggregateOfficialSourceText } from "./source-crawl";
import { generateDraftWithGemini } from "./gemini";
import { buildIntelligenceProvenance, provenanceFromGeminiCitations } from "./provenance";

function buildDraftFromScan(source, text, meta = {}, contentHash) {
  const excerpt = summarizeBody(text, 1400);
  const ch = contentHash || hashContent(text);
  const headline = `${source.name}: possible immigration update detected`;
  const articleUrls = Array.isArray(meta.articleUrls) ? meta.articleUrls : [];
  const articleBlock =
    articleUrls.length > 0
      ? ["Linked official pages included in this scan:", ...articleUrls.map((u) => `- ${u}`), ""]
      : ["No article sub-pages could be fetched; review may rely on the hub excerpt only.", ""];
  return {
    country: source.country,
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    headline,
    summary: excerpt,
    body: [
      `Detected an update candidate from ${source.name}.`,
      "",
      "This draft is auto-generated and requires editor review before publication.",
      "",
      ...articleBlock,
      "Aggregated readable text (hub + articles, truncated for display):",
      excerpt,
      "",
      "Editor checklist:",
      "- Verify this update against official source text",
      "- Confirm effective dates and eligibility scope",
      "- Update affected FAQ entries if needed",
    ].join("\n"),
    faqSuggestions: [
      {
        question: `What changed in ${source.country} immigration policy?`,
        answer:
          "An update candidate was detected from an official source. Review pending draft details and confirm exact effective rules before publishing.",
      },
    ],
    tags: source.tags,
    provenance: buildIntelligenceProvenance(source, { articleUrls, contentHash: ch }),
    grounding: {
      sourceUrl: source.url,
      confidence: articleUrls.length > 0 ? 0.88 : 0.78,
      contentHash: ch,
      excerpt,
      extractedAt: new Date().toISOString(),
      articleUrls,
      aggregatedChars: meta.aggregatedChars ?? text.length,
    },
  };
}

function mergeGeminiIntelligenceDraft(source, text, meta, contentHash, geminiDraft) {
  const excerpt = summarizeBody(text, 1500);
  const articleUrls = Array.isArray(meta.articleUrls) ? meta.articleUrls : [];
  const d = geminiDraft;
  const headline =
    String(d.headline || "").trim().slice(0, 200) || `${source.name}: possible immigration update detected`;
  const summaryText = String(d.summary || "").trim() || excerpt;

  const citationLines = [];
  if (Array.isArray(d.citations)) {
    for (const c of d.citations.slice(0, 5)) {
      const u = String(c?.url || "").trim();
      const q = summarizeBody(String(c?.quote || ""), 260);
      if (u || q) citationLines.push(`- ${u || "(see source material)"}: ${q}`);
    }
  }
  const citationBlock = citationLines.length ? ["Model citations (verify against source):", ...citationLines, ""].join("\n") : "";

  const articleBlock =
    articleUrls.length > 0
      ? ["Official pages included in automated scrape:", ...articleUrls.map((u) => `- ${u}`), ""].join("\n")
      : "";

  const bodyCore = String(d.body || d.summary || "").trim();
  const appendix = [
    articleBlock,
    citationBlock,
    "---",
    "Editor reference — condensed official text (verify before publish):",
    summarizeBody(text, 4500),
  ]
    .filter((s) => s && String(s).trim())
    .join("\n\n");

  const body = [bodyCore, appendix].filter(Boolean).join("\n\n").trim();

  const fallbackFaq = buildDraftFromScan(source, text, meta, contentHash).faqSuggestions;
  const faq =
    Array.isArray(d.faqSuggestions) && d.faqSuggestions.length > 0 ? d.faqSuggestions.slice(0, 3) : fallbackFaq;

  const baseProvenance = buildIntelligenceProvenance(source, { articleUrls, contentHash });
  const citationProvenance = provenanceFromGeminiCitations(d.citations, source.id);

  return {
    country: source.country,
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    headline,
    summary: summarizeBody(summaryText, 400),
    body,
    faqSuggestions: faq,
    provenance: [...baseProvenance, ...citationProvenance].slice(0, 200),
    tags: source.tags,
    seoTitle: String(d.seoTitle || headline || "").trim().slice(0, 200) || headline,
    seoDescription: summarizeBody(String(d.seoDescription || summaryText || ""), 180),
    grounding: {
      sourceUrl: source.url,
      contentHash,
      excerpt,
      extractedAt: new Date().toISOString(),
      articleUrls,
      aggregatedChars: meta.aggregatedChars ?? text.length,
      confidence: Math.min(0.96, Math.max(0.66, Number(d.groundingConfidence) || 0.85)),
      gemini: true,
    },
  };
}

export async function runIntelligenceScan({ actor = "system", maxBytes = 250_000 } = {}) {
  const results = [];
  for (const source of OFFICIAL_INTELLIGENCE_SOURCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35_000);
      const response = await fetch(source.url, {
        signal: controller.signal,
        headers: { "User-Agent": "MinRosh-IntelligenceBot/1.0 (+official-monitor)" },
      });
      clearTimeout(timeout);
      if (!response.ok) {
        results.push({ sourceId: source.id, ok: false, reason: `http_${response.status}` });
        continue;
      }
      const html = await response.text();
      let text;
      let articleUrls = [];
      let aggregatedChars = 0;
      try {
        const agg = await aggregateOfficialSourceText(source, html);
        text = agg.text.slice(0, maxBytes);
        articleUrls = agg.articleUrls;
        aggregatedChars = agg.aggregatedChars;
      } catch {
        text = extractReadableTextFromHtml(html).slice(0, maxBytes);
      }
      const contentHash = hashContent(text);
      const { previous } = upsertSourceSnapshot({
        sourceId: source.id,
        sourceName: source.name,
        url: source.url,
        contentHash,
        excerpt: text,
      });
      if (previous?.contentHash === contentHash) {
        results.push({ sourceId: source.id, ok: true, changed: false });
        continue;
      }

      const event = appendIntelligenceEvent({
        type: "source_changed",
        actor,
        sourceId: source.id,
        sourceName: source.name,
        country: source.country,
        sourceUrl: source.url,
        contentHash,
      });

      let draftPayload = buildDraftFromScan(source, text, { articleUrls, aggregatedChars }, contentHash);
      const gemini = await generateDraftWithGemini({
        source,
        sourceText: text,
        skipTranslations: true,
      });
      if (gemini.ok && gemini.draft && String(gemini.draft.headline || "").trim()) {
        draftPayload = mergeGeminiIntelligenceDraft(
          source,
          text,
          { articleUrls, aggregatedChars },
          contentHash,
          gemini.draft,
        );
      } else {
        draftPayload = {
          ...draftPayload,
          grounding: {
            ...draftPayload.grounding,
            geminiError: gemini.ok === false ? String(gemini.error || "gemini_failed") : "empty_gemini_headline",
          },
        };
      }

      const draft = createPendingDraft(draftPayload);
      pushAdminAlert({
        type: "intelligence_pending",
        title: `Pending intelligence draft (${source.country})`,
        message: `${draft.headline} — review required before publish.`,
        href: "/admin/intelligence",
      });
      await notifyAdminDraftReady({
        headline: draft.headline,
        country: source.country,
        draftId: draft.id,
      });
      results.push({
        sourceId: source.id,
        ok: true,
        changed: true,
        eventId: event.id,
        draftId: draft.id,
      });
    } catch (error) {
      results.push({
        sourceId: source.id,
        ok: false,
        reason: String(error?.name || error?.message || "scan_failed"),
      });
    }
  }
  return {
    ok: true,
    scanned: OFFICIAL_INTELLIGENCE_SOURCES.length,
    changed: results.filter((r) => r.changed).length,
    results,
  };
}
