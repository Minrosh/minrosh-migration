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

function stripHtml(raw) {
  return String(raw || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDraftFromScan(source, text) {
  const excerpt = summarizeBody(text, 600);
  const headline = `${source.name}: possible immigration update detected`;
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
      "Source excerpt:",
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
  };
}

export async function runIntelligenceScan({ actor = "system", maxBytes = 250_000 } = {}) {
  const results = [];
  for (const source of OFFICIAL_INTELLIGENCE_SOURCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
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
      const text = stripHtml(html).slice(0, maxBytes);
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
      const draft = createPendingDraft(buildDraftFromScan(source, text));
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
