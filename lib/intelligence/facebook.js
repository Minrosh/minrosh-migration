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

export function readFacebookPostsStore() {
  ensureStore();
  return readJsonFile(socialFacebookPostsFile, { posts: [] });
}

export async function publishFacebookPost(post) {
  const token = String(process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "").trim();
  const pageId = String(process.env.FACEBOOK_PAGE_ID || "").trim();
  const message = String(post?.text || "").trim();
  if (!token || !pageId) {
    return { ok: false, error: "Facebook credentials not configured", remoteId: "" };
  }
  if (!message) {
    return { ok: false, error: "Post text empty", remoteId: "" };
  }
  const versionRaw = String(process.env.FACEBOOK_GRAPH_VERSION || "v21.0").trim();
  const version = versionRaw.startsWith("v") ? versionRaw : `v${versionRaw}`;
  const url = `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/feed`;
  const body = new URLSearchParams();
  body.set("message", message);
  body.set("access_token", token);
  try {
    const res = await fetch(url, { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = data?.error?.message || res.statusText || "Graph API error";
      return { ok: false, error: errMsg, remoteId: "" };
    }
    const remoteId = String(data?.id || "");
    return { ok: true, error: "", remoteId };
  } catch (e) {
    return { ok: false, error: e?.message || "Network error", remoteId: "" };
  }
}

export function markFacebookPostResult(postId, result) {
  return withMutationLock(lockPath(), () => {
    const store = readJsonFile(socialFacebookPostsFile, { posts: [] });
    const posts = Array.isArray(store.posts) ? store.posts : [];
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx < 0) return false;
    const row = { ...posts[idx] };
    row.updatedAt = new Date().toISOString();
    if (result.ok) {
      row.status = "published";
      row.publishedAt = row.updatedAt;
      row.facebookPostRemoteId = result.remoteId || "";
      row.lastError = "";
      row.nextAttemptAt = null;
    } else {
      row.status = "publish_failed";
      row.lastError = String(result.error || "unknown");
      const attempts = Number(row.publishAttempts || 0) + 1;
      row.publishAttempts = attempts;
      const delayMs = Math.min(3_600_000, 60_000 * 2 ** Math.min(attempts, 8));
      row.nextAttemptAt = new Date(Date.now() + delayMs).toISOString();
    }
    posts[idx] = row;
    writeJsonAtomic(socialFacebookPostsFile, { posts });
    return true;
  });
}
