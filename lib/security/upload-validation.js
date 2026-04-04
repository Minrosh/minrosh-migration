import path from "node:path";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Magic-byte sniff; returns canonical mime or null. */
export function detectBinaryMime(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return "application/pdf";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    const webp = buf.slice(8, 12).toString("ascii");
    if (webp === "WEBP") return "image/webp";
  }
  return null;
}

export function isAllowedStoredMime(mime) {
  return ALLOWED_MIME.has(mime);
}

/**
 * Ensure resolved path is under root (after both are resolved).
 * @param {string} rootAbs
 * @param {string} candidateAbs
 */
export function isPathInsideRoot(rootAbs, candidateAbs) {
  const root = path.resolve(rootAbs) + path.sep;
  const target = path.resolve(candidateAbs);
  return target.startsWith(root);
}
