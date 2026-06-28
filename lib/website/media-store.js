import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  websiteMediaFile,
  websiteMediaSeed,
  websiteMediaStorageDir,
} from "@/lib/admin/paths";
import {
  readWebsiteStore,
  withWebsiteStoreMutation,
  writeWebsiteStore,
} from "@/lib/website/website-store";
import { detectBinaryMime, isAllowedStoredMime } from "@/lib/security/upload-validation";

const EMPTY = { schemaVersion: 1, items: [] };
const MAX_BYTES = 5 * 1024 * 1024;
const WEBSITE_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

function validateMediaStore(raw) {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid store" };
  if (Number(raw.schemaVersion) !== 1) return { ok: false, error: "Unsupported schemaVersion" };
  const items = Array.isArray(raw.items) ? raw.items : [];
  return { ok: true, data: { schemaVersion: 1, items } };
}

function readStoreInternal() {
  return readWebsiteStore(websiteMediaFile, websiteMediaSeed, validateMediaStore, EMPTY);
}

export function readMediaForAdmin() {
  return readStoreInternal();
}

export function listMediaItems() {
  const result = readStoreInternal();
  if (!result.ok || !result.data) return { ok: false, items: [], error: result.error };
  return { ok: true, items: result.data.items, error: null };
}

export function getMediaItemById(id) {
  const listed = listMediaItems();
  if (!listed.ok) return null;
  return listed.items.find((item) => item.id === id) || null;
}

/**
 * @param {{ buffer: Buffer, originalName: string, alt: string, uploadedBy?: string }}
 */
export function addWebsiteMediaItem({ buffer, originalName, alt, uploadedBy }) {
  if (!buffer || buffer.length === 0) throw new Error("Empty file");
  if (buffer.length > MAX_BYTES) throw new Error("File exceeds 5MB limit");
  const mime = detectBinaryMime(buffer);
  if (!mime || !WEBSITE_IMAGE_MIMES.has(mime) || !isAllowedStoredMime(mime)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed");
  }
  const altText = String(alt || "").trim();
  if (!altText) throw new Error("Alt text is required");

  const id = `webmedia-${randomUUID()}`;
  const ext = mime === "image/jpeg" ? ".jpg" : mime === "image/png" ? ".png" : ".webp";
  const storedName = `${id}${ext}`;

  fs.mkdirSync(websiteMediaStorageDir, { recursive: true });
  const absPath = path.join(websiteMediaStorageDir, storedName);
  fs.writeFileSync(absPath, buffer);

  const item = {
    id,
    filename: storedName,
    originalName: String(originalName || storedName).slice(0, 200),
    mime,
    size: buffer.length,
    alt: altText.slice(0, 300),
    createdAt: new Date().toISOString(),
    uploadedBy: uploadedBy || null,
    adminUrl: `/api/admin/website/media/${id}/file`,
  };

  return withWebsiteStoreMutation(websiteMediaFile, () => {
    const result = readStoreInternal();
    const store = result.ok && result.data ? result.data : EMPTY;
    const items = [item, ...(Array.isArray(store.items) ? store.items : [])].slice(0, 500);
    writeWebsiteStore(websiteMediaFile, { schemaVersion: 1, items });
    return item;
  });
}
