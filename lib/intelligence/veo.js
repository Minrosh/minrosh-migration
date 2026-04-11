import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { socialVeoShortsFile } from "@/lib/admin/paths";

function ensureStore() {
  if (fs.existsSync(socialVeoShortsFile)) return;
  fs.mkdirSync(path.dirname(socialVeoShortsFile), { recursive: true });
  writeJsonAtomic(socialVeoShortsFile, { items: [] });
}

function lockPath() {
  return path.join(path.dirname(socialVeoShortsFile), ".social-veo-shorts.lock");
}

function compact(text, max = 180) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

export function queueVeoShortFromDraft(draft, publishedNews) {
  return withMutationLock(lockPath(), () => {
    ensureStore();
    const store = readJsonFile(socialVeoShortsFile, { items: [] });
    const items = Array.isArray(store.items) ? store.items : [];
    const existing = items.find((row) => row.intelligenceDraftId === draft.id);
    if (existing) return existing;
    const row = {
      id: `veo-short-${randomUUID()}`,
      status: "queued",
      createdAt: new Date().toISOString(),
      intelligenceDraftId: draft.id,
      title: `Visa Alert: ${compact(draft.headline, 90)}`,
      script: [
        "Breaking visa update.",
        compact(draft.summary, 140),
        `Read full details at ${publishedNews?.href || draft.href || "/updates"}.`,
        "Consult MinRosh for a tailored eligibility strategy.",
      ].join(" "),
      durationSeconds: 15,
      platformTargets: ["reels", "tiktok", "youtube-shorts"],
      meta: {
        generatedBy: "intelligence_pipeline",
        provider: "veo",
        pendingProviderIntegration: true,
      },
    };
    items.unshift(row);
    writeJsonAtomic(socialVeoShortsFile, { items: items.slice(0, 1500) });
    return row;
  });
}
