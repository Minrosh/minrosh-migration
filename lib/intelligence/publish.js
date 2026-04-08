import path from "node:path";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";

const newsFile = path.join(process.cwd(), "data", "news.json");

function countryLabel(code) {
  const normalized = String(code || "").toUpperCase();
  if (normalized === "AU") return "Australia";
  if (normalized === "UK") return "United Kingdom";
  if (normalized === "NZ") return "New Zealand";
  if (normalized === "CA") return "Canada";
  return normalized || "Unknown";
}

function lockPath() {
  return path.join(path.dirname(newsFile), ".news-mutation.lock");
}

export function publishDraftToNewsStore(draft) {
  return withMutationLock(lockPath(), () => {
    const list = readJsonFile(newsFile, []);
    const entries = Array.isArray(list) ? list : [];
    const existing = entries.find((item) => item.intelligenceDraftId === draft.id);
    if (existing) return existing;

    const row = {
      date: new Date().toISOString().slice(0, 10),
      country: countryLabel(draft.country),
      source: draft.sourceName || "Official source",
      sourceUrl: draft.sourceUrl || "",
      href: draft.href || "/updates",
      title: draft.seoTitle || draft.headline || "Immigration update",
      summary: draft.seoDescription || draft.summary || "",
      intelligenceDraftId: draft.id,
    };
    entries.unshift(row);
    writeJsonAtomic(newsFile, entries.slice(0, 300));
    return row;
  });
}
