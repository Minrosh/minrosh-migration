import { createHash, timingSafeEqual } from "node:crypto";

export function hashMagicToken(plain) {
  return createHash("sha256").update(String(plain), "utf8").digest("hex");
}

function bufHex(hex) {
  try {
    return Buffer.from(String(hex), "hex");
  } catch {
    return null;
  }
}

export function verifyMagicTokenHash(plain, storedHashHex) {
  if (!plain || !storedHashHex) return false;
  const a = bufHex(hashMagicToken(plain));
  const b = bufHex(storedHashHex);
  if (!a || !b || a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Legacy plaintext token compare (constant length UUID). */
export function verifyLegacyMagicToken(plain, storedPlain) {
  const p = String(plain || "");
  const s = String(storedPlain || "");
  if (!p || !s || p.length !== s.length) return false;
  try {
    return timingSafeEqual(Buffer.from(p, "utf8"), Buffer.from(s, "utf8"));
  } catch {
    return false;
  }
}
