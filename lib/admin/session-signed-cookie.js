/**
 * HMAC-signed admin session cookie — Web Crypto only (Edge middleware + Node).
 * Format: {token}.{expiresAtMs}.{base64url(hmac)}
 */

function getCrypto() {
  const c = globalThis.crypto;
  if (!c?.subtle) {
    throw new Error("Web Crypto is not available");
  }
  return c;
}

function utf8(s) {
  return new TextEncoder().encode(s);
}

async function hmacKeyFromSecret(secret) {
  const digest = await getCrypto().subtle.digest("SHA-256", utf8(String(secret)));
  return getCrypto().subtle.importKey("raw", digest, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function base64UrlEncode(bytes) {
  const u = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u.length; i++) binary += String.fromCharCode(u[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(s) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/**
 * @param {string} token
 * @param {number} expiresAtMs
 * @param {string} secret
 */
export async function signAdminSessionCookie(token, expiresAtMs, secret) {
  if (!secret) throw new Error("Missing session secret");
  const key = await hmacKeyFromSecret(secret);
  const payload = `${token}.${expiresAtMs}`;
  const sig = await getCrypto().subtle.sign("HMAC", key, utf8(payload));
  return `${payload}.${base64UrlEncode(sig)}`;
}

/**
 * @param {string} cookieValue
 * @param {string} secret
 * @returns {Promise<{ ok: true, token: string, expiresAtMs: number } | { ok: false }>}
 */
export async function verifyAdminSessionCookie(cookieValue, secret) {
  if (!cookieValue || typeof cookieValue !== "string" || !secret) {
    return { ok: false };
  }
  const parts = cookieValue.split(".");
  if (parts.length !== 3) {
    return { ok: false };
  }
  const [token, expStr, sigPart] = parts;
  const expiresAtMs = Number(expStr);
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return { ok: false };
  }
  if (!Number.isFinite(expiresAtMs)) {
    return { ok: false };
  }
  if (Date.now() > expiresAtMs) {
    return { ok: false };
  }
  let sigBytes;
  try {
    sigBytes = base64UrlDecode(sigPart);
  } catch {
    return { ok: false };
  }
  const key = await hmacKeyFromSecret(secret);
  const payload = `${token}.${expiresAtMs}`;
  const valid = await getCrypto().subtle.verify("HMAC", key, sigBytes, utf8(payload));
  if (!valid) {
    return { ok: false };
  }
  return { ok: true, token, expiresAtMs };
}

/**
 * For logout / revocation: get raw session token from cookie value.
 * @param {string} cookieValue
 * @param {string} secret
 */
export async function extractAdminSessionTokenFromCookie(cookieValue, secret) {
  const v = await verifyAdminSessionCookie(cookieValue, secret);
  if (v.ok) {
    return v.token;
  }
  if (/^[a-f0-9]{64}$/i.test(String(cookieValue || ""))) {
    return cookieValue;
  }
  return null;
}
