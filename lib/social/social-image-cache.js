import fs from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import { socialImageCacheDir } from "@/lib/admin/paths";

export function getSocialImageSecret() {
  return String(process.env.SOCIAL_PUBLISH_IMAGE_SECRET || "").trim();
}

export function socialImageSecretConfigured() {
  const s = getSocialImageSecret();
  if (process.env.NODE_ENV === "production" && s.length > 0 && s.length < 16) return false;
  return Boolean(s);
}

function pngPath(postId) {
  const safe = String(postId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return null;
  return path.join(socialImageCacheDir, `${safe}.png`);
}

export function ensureSocialImageCacheDir() {
  fs.mkdirSync(socialImageCacheDir, { recursive: true });
}

export function writeSocialImagePng(postId, buffer) {
  const p = pngPath(postId);
  if (!p) return false;
  ensureSocialImageCacheDir();
  fs.writeFileSync(p, buffer);
  return true;
}

export function readSocialImagePng(postId) {
  const p = pngPath(postId);
  if (!p || !fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

export function removeSocialImagePng(postId) {
  const p = pngPath(postId);
  if (!p || !fs.existsSync(p)) return;
  try {
    fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} postId
 * @param {number} [ttlSec] default 72h
 * @returns {{ exp: number, sig: string } | null}
 */
export function signSocialImageRequest(postId, ttlSec = 72 * 3600) {
  const id = String(postId || "").trim();
  if (!id) return null;
  const secret = getSocialImageSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const sig = createHmac("sha256", secret).update(`${id}:${exp}`).digest("hex");
  return { exp, sig };
}

export function verifySocialImageRequest(postId, expSec, sigHex) {
  const id = String(postId || "").trim();
  const exp = Number(expSec);
  if (!id || !Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const secret = getSocialImageSecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${id}:${exp}`).digest();
  let got;
  try {
    got = Buffer.from(String(sigHex || "").trim(), "hex");
  } catch {
    return false;
  }
  if (got.length !== expected.length) return false;
  return timingSafeEqual(got, expected);
}
