/**
 * Turn intelligence drafts into short, visitor-safe copy for `data/news.json` (no internal checklists or URL dumps).
 */

function stripInternalDraftBoilerplate(text) {
  let s = String(text || "");

  s = s.replace(/\n*Linked official pages included in this scan:\s*\n(?:[ \t]*-[^\n]+\n)+/gi, "\n\n");
  s = s.replace(/\n*Official pages included in automated scrape:\s*\n(?:[ \t]*-[^\n]+\n)+/gi, "\n\n");
  s = s.replace(/\n*No article sub-pages could be fetched[^\n]*\n*/gi, "\n\n");

  if (/\nEditor checklist:/i.test(s)) {
    s = s.replace(/\n*Aggregated readable text[^\n]*:[\s\S]*?\n+Editor checklist:/gi, "\n\nEditor checklist:");
    s = s.replace(/\n*Editor checklist:\s*\n(?:[ \t]*-[^\n]+\n)+/gi, "\n\n");
  } else {
    s = s.replace(/\n*Aggregated readable text[^\n]*:[\s\S]*$/gi, "\n\n");
  }

  s = s.replace(/\n*Model citations \(verify against source\):[\s\S]*?(?=\n---|\n*Editor reference|$)/gi, "\n\n");
  s = s.replace(/\n*Editor reference —[\s\S]*/gi, "\n\n");

  s = s.replace(/^Detected an update candidate from[^\n]+\n*/im, "");
  s = s.replace(/^This draft is auto-generated[^\n]+\n*/im, "");
  s = s.replace(/^\[Listing hub\][^\n]*\n*/i, "");
  s = s.replace(/^\[Article\][^\n]*\n*/gim, "");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

export function sanitizePublishedNewsTitle(draft) {
  const raw = String(draft?.seoTitle || draft?.headline || "").trim();
  if (raw && !/possible immigration update detected/i.test(raw)) {
    return raw.slice(0, 200);
  }
  const s = String(draft?.seoDescription || draft?.summary || "").trim();
  const sentence = s.split(/(?<=[.!?])\s+/)[0]?.trim() || s.split("\n")[0]?.trim() || "";
  if (sentence.length >= 24) return sentence.length <= 200 ? sentence : `${sentence.slice(0, 197)}…`;
  const src = String(draft?.sourceName || "Immigration").trim();
  return `${src}: update note`.slice(0, 200);
}

/**
 * Reader-facing body only (no linked-URL lists, aggregated scrape dumps, or editor checklists).
 */
export function extractPublicNewsBody(draft) {
  const summary = String(draft?.summary || "").trim();
  const seo = String(draft?.seoDescription || "").trim();
  let body = String(draft?.body || "").trim();

  if (body) {
    if (draft?.grounding?.gemini && /\n---\s*\n/.test(body)) {
      const head = body.split(/\n---\s*\n/)[0].trim();
      if (head.length >= 40) body = head;
    }
    body = stripInternalDraftBoilerplate(body);
  }

  if (body.length >= 80) return body;

  const lead = seo || summary;
  if (!lead) {
    return "MinRosh is monitoring this topic. Use “Open official announcement” for authoritative wording.";
  }
  return [
    lead,
    "",
    "This page is a short orientation note. Confirm eligibility, dates, and requirements on the official source linked above before you act.",
  ].join("\n");
}
