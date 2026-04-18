import { createSupabaseAdminClient, getSupabaseUrl } from "@/lib/supabase/server";
import {
  signSocialImageRequest,
  writeSocialImagePng,
  socialImageSecretConfigured,
} from "@/lib/social/social-image-cache";

function publicSiteBase() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/$/, "");
}

function signedGraphImageUrl(postId) {
  const base = publicSiteBase();
  if (!base.startsWith("https://")) return null;
  const signed = signSocialImageRequest(postId);
  if (!signed) return null;
  const u = new URL("/api/social/graph-image", base);
  u.searchParams.set("postId", postId);
  u.searchParams.set("e", String(signed.exp));
  u.searchParams.set("s", signed.sig);
  return u.toString();
}

/**
 * Upload to Supabase when configured; otherwise write disk cache and return signed HTTPS URL.
 * @param {string} postId
 * @param {Buffer} pngBuffer
 * @returns {Promise<{ url: string, storedLocally: boolean } | null>}
 */
export async function publishSocialPosterToPublicUrl(postId, pngBuffer) {
  const fromSupabase = await uploadSocialPosterIfConfigured(postId, pngBuffer);
  if (fromSupabase) return { url: fromSupabase, storedLocally: false };
  if (!socialImageSecretConfigured()) return null;
  if (!writeSocialImagePng(postId, pngBuffer)) return null;
  const url = signedGraphImageUrl(postId);
  if (!url) return null;
  return { url, storedLocally: true };
}

/**
 * @param {string} postId
 * @param {Buffer} buffer
 * @returns {Promise<string | null>} public URL or null
 */
export async function uploadSocialPosterIfConfigured(postId, buffer) {
  const bucket = String(process.env.SOCIAL_SUPABASE_BUCKET || "").trim();
  const supabase = createSupabaseAdminClient();
  if (!supabase || !bucket) return null;
  const key = `social/${postId}.png`;
  const { error } = await supabase.storage.from(bucket).upload(key, buffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return data?.publicUrl || null;
}

export function supabaseConfiguredForSocial() {
  return Boolean(getSupabaseUrl().trim() && String(process.env.SOCIAL_SUPABASE_BUCKET || "").trim());
}
