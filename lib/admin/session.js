function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export async function createSessionToken() {
  const pass = getAdminPassword();
  const secret = getSessionSecret();
  if (!pass || !secret) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(pass));
  return bufferToHex(sig);
}

export async function isValidSessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const expected = await createSessionToken();
  if (!expected || token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
