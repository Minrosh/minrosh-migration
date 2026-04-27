import { readSocialImagePng, verifySocialImageRequest } from "@/lib/social/social-image-cache";

export const dynamic = "force-dynamic";

/**
 * Public signed URL for Meta to fetch a queued poster PNG (HMAC query params).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = String(searchParams.get("postId") || "").trim();
  const e = searchParams.get("e");
  const s = String(searchParams.get("s") || "").trim();
  if (!postId || !e || !s) {
    return new Response("Bad Request", { status: 400 });
  }
  if (!verifySocialImageRequest(postId, e, s)) {
    return new Response("Forbidden", { status: 403 });
  }
  const buf = readSocialImagePng(postId);
  if (!buf) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(buf, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
    },
  });
}
