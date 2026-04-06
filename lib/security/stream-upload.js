import fs from "node:fs";
import { once } from "node:events";
import { finished } from "node:stream/promises";
import { detectBinaryMime, isAllowedStoredMime } from "@/lib/security/upload-validation";

/**
 * Stream a Web `File` body to disk with a hard byte cap (avoids full-file RAM buffer).
 * Only the first 12 bytes are held for magic-byte sniffing; further data streams (subject to chunk sizes from the runtime).
 * @param {File} file
 * @param {string} diskPath
 * @param {number} maxBytes
 * @returns {Promise<{ detected?: string, error?: string }>}
 */
export async function streamWebFileToDisk(file, diskPath, maxBytes) {
  const label = file.name || "file";
  if (typeof file.stream !== "function") {
    return { error: "Upload not supported in this environment" };
  }

  const body = file.stream();
  const reader = body.getReader();
  /** @type {Buffer[]} */
  const pending = [];
  let prefix = Buffer.alloc(0);
  /** @type {import("node:fs").WriteStream | null} */
  let ws = null;

  async function stopReader() {
    await reader.cancel().catch(() => {});
  }

  try {
    while (prefix.length < 12) {
      const { done, value } = await reader.read();
      if (done) {
        await stopReader();
        return { error: `File too small or empty: ${label}` };
      }
      const chunk = Buffer.from(value);
      const need = 12 - prefix.length;
      if (chunk.length <= need) {
        prefix = Buffer.concat([prefix, chunk]);
      } else {
        prefix = Buffer.concat([prefix, chunk.subarray(0, need)]);
        pending.push(chunk.subarray(need));
      }
    }

    const detected = detectBinaryMime(prefix.subarray(0, 12));
    if (!detected || !isAllowedStoredMime(detected)) {
      await stopReader();
      return { error: `Not allowed: ${label} (PDF, JPEG, PNG, or WebP only)` };
    }

    const queued = 12 + pending.reduce((n, b) => n + b.length, 0);
    if (queued > maxBytes) {
      await stopReader();
      return { error: `Too large: ${label} (max ${Math.floor(maxBytes / (1024 * 1024))}MB each)` };
    }

    ws = fs.createWriteStream(diskPath);
    let consumed = 0;

    async function writeChunk(buf) {
      if (buf.length === 0) return;
      if (consumed + buf.length > maxBytes) {
        throw new Error("SIZE");
      }
      consumed += buf.length;
      if (!ws.write(buf)) {
        await once(ws, "drain");
      }
    }

    await writeChunk(prefix.subarray(0, 12));
    prefix = Buffer.alloc(0);
    for (const p of pending) {
      await writeChunk(p);
    }
    pending.length = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await writeChunk(Buffer.from(value));
    }

    ws.end();
    await finished(ws);
    return { detected };
  } catch (e) {
    ws?.destroy();
    await stopReader();
    try {
      fs.unlinkSync(diskPath);
    } catch {
      /* no partial file */
    }
    if (e?.message === "SIZE") {
      return { error: `Too large: ${label} (max ${Math.floor(maxBytes / (1024 * 1024))}MB each)` };
    }
    return { error: `Could not save ${label}` };
  }
}
