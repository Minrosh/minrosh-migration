import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import siteData from "@/data/site.json";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { intelligenceFaqPatchesFile } from "@/lib/admin/paths";

function ensureFaqPatchStore() {
  if (fs.existsSync(intelligenceFaqPatchesFile)) return;
  fs.mkdirSync(path.dirname(intelligenceFaqPatchesFile), { recursive: true });
  writeJsonAtomic(intelligenceFaqPatchesFile, { patches: [] });
}

function lockPath() {
  return path.join(path.dirname(intelligenceFaqPatchesFile), ".intelligence-faq-patches.lock");
}

export function readFaqPatches() {
  ensureFaqPatchStore();
  return readJsonFile(intelligenceFaqPatchesFile, { patches: [] });
}

export function writeFaqPatches(payload) {
  ensureFaqPatchStore();
  writeJsonAtomic(intelligenceFaqPatchesFile, payload);
}

export function applyFaqSuggestionsFromDraft(draft) {
  const suggestions = Array.isArray(draft?.faqSuggestions) ? draft.faqSuggestions : [];
  if (!suggestions.length) return [];
  return withMutationLock(lockPath(), () => {
    const store = readFaqPatches();
    const patches = Array.isArray(store.patches) ? store.patches : [];
    const now = new Date().toISOString();
    const created = [];
    for (const item of suggestions) {
      const question = String(item?.question || "").trim();
      const answer = String(item?.answer || "").trim();
      if (!question || !answer) continue;
      const exists = patches.some((p) => p.question.toLowerCase() === question.toLowerCase() && p.active !== false);
      if (exists) continue;
      const row = {
        id: `faq-patch-${randomUUID()}`,
        question,
        answer,
        country: draft.country || "",
        sourceUrl: draft.sourceUrl || "",
        sourceName: draft.sourceName || "",
        intelligenceDraftId: draft.id,
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      patches.unshift(row);
      created.push(row);
    }
    writeFaqPatches({ patches: patches.slice(0, 2000) });
    return created;
  });
}

export function mergedFaqItems() {
  const baseFaq = Array.isArray(siteData?.faq) ? siteData.faq : [];
  const store = readFaqPatches();
  const patches = Array.isArray(store.patches) ? store.patches.filter((p) => p.active !== false) : [];
  const seen = new Set(baseFaq.map((f) => String(f.question || "").trim().toLowerCase()));
  const merged = [...baseFaq];
  for (const patch of patches) {
    const key = String(patch.question || "").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    merged.push({ question: patch.question, answer: patch.answer });
    seen.add(key);
  }
  return merged;
}
