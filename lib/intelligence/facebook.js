import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { socialFacebookPostsFile } from "@/lib/admin/paths";

function ensureStore() {
  if (fs.existsSync(socialFacebookPostsFile)) return;
  fs.mkdirSync(path.dirname(socialFacebookPostsFile), { recursive: true });
  writeJsonAtomic(socialFacebookPostsFile, { posts: [] });
}

function lockPath() {
  return path.join(path.dirname(socialFacebookPostsFile), ".social-facebook-posts.lock");
}

function compact(text, max = 260) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

function hashtagByCountry(country) {
  const c = String(country || "").toUpperCase();
  if (c === "AU") return "#AustraliaVisa";
  if (c === "UK") return "#UKVisa";
  if (c === "NZ") return "#NZVisa";
  if (c === "CA") return "#CanadaVisa";
  return "#VisaUpdate";
}

export function queueFacebookPostFromDraft(draft, publishedNews) {
  return withMutationLock(lockPath(), () => {
    ensureStore();
    const store = readJsonFile(socialFacebookPostsFile, { posts: [] });
    const posts = Array.isArray(store.posts) ? store.posts : [];
    const existing = posts.find((p) => p.intelligenceDraftId === draft.id);
    if (existing) return existing;
    const row = {
      id: `fb-post-${randomUUID()}`,
      status: "ready_auto_publish",
      createdAt: new Date().toISOString(),
      intelligenceDraftId: draft.id,
      country: draft.country,
      sourceUrl: draft.sourceUrl || "",
      headline: draft.headline || "",
      websiteHref: publishedNews?.href || draft.href || "/updates",
      text: [
        `Visa Alert: ${compact(draft.headline, 100)}`,
        compact(draft.summary, 170),
        `Read more: ${publishedNews?.href || draft.href || "/updates"}`,
        `${hashtagByCountry(draft.country)} #MigrationNews #MinRosh`,
      ].join("\n\n"),
      visual: {
        backgroundStrategy: "news-card-background",
        logoOverlayRequired: true,
        logoPath: "/images/minrosh-logo.jpg",
        renderEngine: "sharp-or-canvas",
      },
      meta: {
        autoPublishOnApproval: true,
        generatedBy: "intelligence_pipeline",
      },
    };
    posts.unshift(row);
    writeJsonAtomic(socialFacebookPostsFile, { posts: posts.slice(0, 2000) });
    return row;
  });
}
