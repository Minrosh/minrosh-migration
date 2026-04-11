import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { intelligenceChannelQueueFile } from "@/lib/admin/paths";

function ensureStore() {
  if (fs.existsSync(intelligenceChannelQueueFile)) return;
  fs.mkdirSync(path.dirname(intelligenceChannelQueueFile), { recursive: true });
  writeJsonAtomic(intelligenceChannelQueueFile, { items: [] });
}

function lockPath() {
  return path.join(path.dirname(intelligenceChannelQueueFile), ".intelligence-channel-queue.lock");
}

export function queueNewsletterFromDraft(draft, publishedNews) {
  return withMutationLock(lockPath(), () => {
    ensureStore();
    const store = readJsonFile(intelligenceChannelQueueFile, { items: [] });
    const items = Array.isArray(store.items) ? store.items : [];
    const existing = items.find(
      (row) => row.channel === "newsletter" && row.intelligenceDraftId === draft.id && row.status !== "cancelled"
    );
    if (existing) return existing;
    const row = {
      id: `channel-${randomUUID()}`,
      channel: "newsletter",
      status: "queued",
      createdAt: new Date().toISOString(),
      intelligenceDraftId: draft.id,
      title: draft.seoTitle || draft.headline || "Immigration update",
      summary: draft.seoDescription || draft.summary || "",
      href: publishedNews?.href || draft.href || "/updates",
      countries: [draft.country].filter(Boolean),
      languages: Object.keys(draft.translations || {}),
      meta: {
        generatedBy: "intelligence_pipeline",
      },
    };
    items.unshift(row);
    writeJsonAtomic(intelligenceChannelQueueFile, { items: items.slice(0, 3000) });
    return row;
  });
}
