import fs from "node:fs";
import path from "node:path";

/**
 * Normalizes GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY for google-auth-library / OpenSSL.
 * Handles literal \\n, stray surrounding quotes, and PEM bodies pasted without BEGIN/END lines.
 */
export function normalizeGoogleServiceAccountPrivateKey(raw) {
  let s = String(raw ?? "").trim();
  if (!s) return "";
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  while (s.startsWith('"') || s.startsWith("'")) s = s.slice(1).trim();
  while (s.endsWith('"') || s.endsWith("'")) s = s.slice(0, -1).trim();
  s = s.replace(/\\n/g, "\n").trim();
  if (!s.includes("BEGIN")) {
    s = s.replace(/^\n+/, "");
    s = `-----BEGIN PRIVATE KEY-----\n${s}`;
  }
  if (!s.includes("END PRIVATE")) {
    s = s.replace(/\n+$/, "");
    s = `${s}\n-----END PRIVATE KEY-----\n`;
  }
  return s;
}

/** Absolute path to the service account JSON if GOOGLE_APPLICATION_CREDENTIALS is set and readable. */
export function googleServiceAccountCredentialsPath() {
  const p = String(process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();
  if (!p) return "";
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  try {
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * Loads client_email + private_key. Prefers GOOGLE_APPLICATION_CREDENTIALS (GCP JSON) so the key
 * always matches the service account (avoids invalid_grant / Invalid signature from .env PEM drift).
 */
export function readGoogleServiceAccountCredentialsFromEnv() {
  const credPath = googleServiceAccountCredentialsPath();
  if (credPath) {
    try {
      const j = JSON.parse(fs.readFileSync(credPath, "utf8"));
      const clientEmail = String(j.client_email || "").trim();
      const privateKey = normalizeGoogleServiceAccountPrivateKey(j.private_key);
      if (clientEmail && privateKey) return { clientEmail, privateKey };
    } catch {
      /* fall through to env vars */
    }
  }
  const clientEmail = String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim();
  const privateKey = normalizeGoogleServiceAccountPrivateKey(
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );
  return { clientEmail, privateKey };
}

export function readGoogleServiceAccountPrivateKeyFromEnv() {
  return readGoogleServiceAccountCredentialsFromEnv().privateKey;
}

export function isGoogleServiceAccountConfigured() {
  const { clientEmail, privateKey } = readGoogleServiceAccountCredentialsFromEnv();
  return Boolean(clientEmail && privateKey);
}
