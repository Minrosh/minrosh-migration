import { adminJsonUnauthorized, verifyAdminRequest } from "@/lib/admin/auth-route";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";
import { readFacebookPostsStore } from "@/lib/intelligence/facebook";
import { captionStats } from "@/lib/social/meta-caption";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const store = readFacebookPostsStore();
  const posts = Array.isArray(store.posts) ? store.posts : [];
  const slice = posts.slice(0, 40).map((p) => ({
    id: p.id,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt || "",
    publishedAt: p.publishedAt || "",
    country: p.country,
    headline: p.headline,
    text: p.text,
    facebookPostRemoteId: p.facebookPostRemoteId || "",
    instagramPostRemoteId: p.instagramPostRemoteId || "",
    instagramPublishError: p.instagramPublishError || "",
    lastError: p.lastError || "",
    stats: captionStats(p.text),
  }));
  return apiOk({ posts: slice }, context);
}
