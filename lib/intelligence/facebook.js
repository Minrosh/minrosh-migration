import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { socialFacebookPostsFile } from "@/lib/admin/paths";
import { buildMetaCaption, countryDisplayName } from "@/lib/social/meta-caption";
import { generateVisaNewsPng } from "@/lib/social/visa-news-image";
import { publishSocialPosterToPublicUrl } from "@/lib/social/image-hosting";
import { removeSocialImagePng } from "@/lib/social/social-image-cache";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function ensureStore() {
  if (fs.existsSync(socialFacebookPostsFile)) return;
  fs.mkdirSync(path.dirname(socialFacebookPostsFile), { recursive: true });
  writeJsonAtomic(socialFacebookPostsFile, { posts: [] });
}

function lockPath() {
  return path.join(path.dirname(socialFacebookPostsFile), ".social-facebook-posts.lock");
}

function graphVersion() {
  const versionRaw = String(process.env.FACEBOOK_GRAPH_VERSION || "v21.0").trim();
  return versionRaw.startsWith("v") ? versionRaw : `v${versionRaw}`;
}

function summaryFromQueuedPost(post) {
  const blocks = String(post.text || "")
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (blocks.length >= 2) return blocks[1];
  return "";
}

function compact(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

async function postFacebookFeedMessage({ pageId, token, version, message, idempotencyKey }) {
  const url = `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/feed`;
  const body = new URLSearchParams();
  body.set("message", message);
  body.set("access_token", token);
  const headers = idempotencyKey ? { "Idempotency-Key": String(idempotencyKey).slice(0, 200) } : {};
  const res = await fetch(url, { method: "POST", body, headers });
  const data = await parseJsonResponseSafe(res);
  if (!res.ok) {
    const errMsg = data?.error?.message || res.statusText || "Graph API error";
    return { ok: false, error: errMsg, remoteId: "" };
  }
  return { ok: true, error: "", remoteId: String(data?.id || "") };
}

async function postFacebookPagePhoto({ pageId, token, version, imageUrl, message, idempotencyKey }) {
  const url = `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/photos`;
  const body = new URLSearchParams();
  body.set("url", imageUrl);
  body.set("message", message);
  body.set("published", "true");
  body.set("access_token", token);
  const headers = idempotencyKey ? { "Idempotency-Key": String(idempotencyKey).slice(0, 200) } : {};
  const res = await fetch(url, { method: "POST", body, headers });
  const data = await parseJsonResponseSafe(res);
  if (!res.ok) {
    const errMsg = data?.error?.message || res.statusText || "Graph API error";
    return { ok: false, error: errMsg, remoteId: "" };
  }
  return { ok: true, error: "", remoteId: String(data?.post_id || data?.id || "") };
}

async function waitForIgContainer(containerId, token, version) {
  const fields = encodeURIComponent("status_code");
  const base = `https://graph.facebook.com/${version}/${encodeURIComponent(containerId)}?fields=${fields}&access_token=${encodeURIComponent(token)}`;
  for (let i = 0; i < 24; i += 1) {
    const res = await fetch(base);
    const data = await parseJsonResponseSafe(res);
    if (data?.error) {
      return { ok: false, error: data.error.message || "Instagram container error" };
    }
    const code = String(data?.status_code || "").toUpperCase();
    if (!code || code === "FINISHED" || code === "PUBLISHED") return { ok: true, error: "" };
    if (code === "ERROR") {
      return { ok: false, error: "Instagram container status ERROR" };
    }
    if (code !== "IN_PROGRESS" && code !== "EXPIRED") {
      return { ok: true, error: "" };
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { ok: false, error: "Instagram media not ready (timeout)" };
}

async function publishInstagramFeedPost({ igUserId, token, version, imageUrl, caption, altText }) {
  const createUrl = `https://graph.facebook.com/${version}/${encodeURIComponent(igUserId)}/media`;
  const cBody = new URLSearchParams();
  cBody.set("image_url", imageUrl);
  cBody.set("caption", caption);
  cBody.set("access_token", token);
  if (altText) cBody.set("alt_text", altText.slice(0, 420));
  const cRes = await fetch(createUrl, { method: "POST", body: cBody });
  const cData = await parseJsonResponseSafe(cRes);
  if (!cRes.ok) {
    return { id: "", error: cData?.error?.message || cRes.statusText || "Instagram create failed" };
  }
  const creationId = String(cData?.id || "").trim();
  if (!creationId) {
    return { id: "", error: "Instagram create returned no id" };
  }
  const ready = await waitForIgContainer(creationId, token, version);
  if (!ready.ok) {
    return { id: "", error: ready.error || "Instagram not ready" };
  }
  const pubUrl = `https://graph.facebook.com/${version}/${encodeURIComponent(igUserId)}/media_publish`;
  const pBody = new URLSearchParams();
  pBody.set("creation_id", creationId);
  pBody.set("access_token", token);
  const pRes = await fetch(pubUrl, { method: "POST", body: pBody });
  const pData = await parseJsonResponseSafe(pRes);
  if (!pRes.ok) {
    return { id: "", error: pData?.error?.message || pRes.statusText || "Instagram publish failed" };
  }
  return { id: String(pData?.id || ""), error: "" };
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
      text: buildMetaCaption({
        headline: draft.headline || "",
        summary: draft.summary || "",
        country: draft.country,
        readMoreHref: publishedNews?.href || draft.href || "/updates",
      }),
      visual: {
        backgroundStrategy: "news-card-background",
        logoOverlayRequired: true,
        logoPath: "/images/minrosh-logo.png",
        renderEngine: "satori",
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

function readPostRowById(postId) {
  if (!postId) return null;
  ensureStore();
  const store = readJsonFile(socialFacebookPostsFile, { posts: [] });
  const posts = Array.isArray(store.posts) ? store.posts : [];
  return posts.find((p) => p.id === postId) || null;
}

/**
 * @returns {Promise<{ ok: boolean, error: string, remoteId: string, instagramMediaId?: string, instagramError?: string }>}
 */
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
  const latest = readPostRowById(post?.id);
  const remoteExisting = String(latest?.facebookPostRemoteId || "").trim();
  if (remoteExisting) {
    return {
      ok: true,
      error: "",
      remoteId: remoteExisting,
      instagramMediaId: String(latest?.instagramPostRemoteId || "").trim(),
      instagramError: String(latest?.instagramPublishError || "").trim(),
    };
  }
  const version = graphVersion();
  const idempotencyKey = post?.id ? `minrosh-fb-${post.id}` : "";

  let imageUrl = null;
  /** Disk file kept for Meta crawl; remove only when photo path abandoned or full failure. */
  let imageStoredLocally = false;
  try {
    const png = await generateVisaNewsPng({
      headline: post.headline || compact(message, 120),
      country: post.country,
      summary: summaryFromQueuedPost(post),
    });
    const hosted = await publishSocialPosterToPublicUrl(post.id, png);
    if (hosted?.url) {
      imageUrl = hosted.url;
      imageStoredLocally = Boolean(hosted.storedLocally);
    }
  } catch {
    imageUrl = null;
  }

  let fbResult;
  if (imageUrl) {
    fbResult = await postFacebookPagePhoto({ pageId, token, version, imageUrl, message, idempotencyKey });
    if (!fbResult.ok) {
      if (imageStoredLocally) removeSocialImagePng(post.id);
      imageStoredLocally = false;
      imageUrl = null;
      fbResult = await postFacebookFeedMessage({ pageId, token, version, message, idempotencyKey });
    }
  } else {
    fbResult = await postFacebookFeedMessage({ pageId, token, version, message, idempotencyKey });
  }

  if (!fbResult.ok) {
    if (imageStoredLocally) removeSocialImagePng(post.id);
    return {
      ok: false,
      error: fbResult.error,
      remoteId: "",
      instagramMediaId: "",
      instagramError: "",
    };
  }

  let instagramMediaId = "";
  let instagramError = "";
  const igOn = String(process.env.SOCIAL_PUBLISH_INSTAGRAM || "").toLowerCase() === "true";
  const igUserId = String(process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "").trim();
  if (igOn && igUserId && imageUrl) {
    const place = countryDisplayName(post.country);
    const altText = `Graphic summarising a visa update for ${place}: ${compact(post.headline, 90)}`;
    const ig = await publishInstagramFeedPost({
      igUserId,
      token,
      version,
      imageUrl,
      caption: message,
      altText,
    });
    instagramMediaId = ig.id || "";
    instagramError = ig.error || "";
  }

  return {
    ok: true,
    error: "",
    remoteId: fbResult.remoteId,
    instagramMediaId,
    instagramError,
  };
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
      row.instagramPostRemoteId = result.instagramMediaId || "";
      row.instagramPublishError = result.instagramError || "";
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
