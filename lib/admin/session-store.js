/**
 * File-backed admin sessions (single Node process). For PM2 cluster, containers, or HA,
 * replace with Redis/Upstash or a database and keep the same token + HMAC cookie contract.
 */
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonAtomic } from "../contact";

const sessionsFile = path.join(process.cwd(), "data", "admin-sessions.json");
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function ensureSessionsFile() {
  if (fs.existsSync(sessionsFile)) return;
  fs.mkdirSync(path.dirname(sessionsFile), { recursive: true });
  writeJsonAtomic(sessionsFile, { sessions: [] });
}

function hashToken(token) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function readRaw() {
  ensureSessionsFile();
  return readJsonFile(sessionsFile, { sessions: [] });
}

function pruneExpired(sessions, now) {
  return sessions.filter((s) => s.expiresAt > now);
}

/**
 * Replace all sessions (single admin user — rotate on login).
 * @returns {{ token: string, expiresAt: number }}
 */
export function createAdminSession() {
  ensureSessionsFile();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = Date.now();
  const expiresAt = now + TTL_MS;
  writeJsonAtomic(sessionsFile, {
    sessions: [{ tokenHash, createdAt: now, expiresAt }],
  });
  return { token, expiresAt };
}

export function validateAdminSessionToken(token) {
  if (!token || typeof token !== "string" || token.length !== 64) return false;
  if (!/^[a-f0-9]+$/i.test(token)) return false;
  ensureSessionsFile();
  const now = Date.now();
  const data = readRaw();
  let sessions = pruneExpired(data.sessions || [], now);
  const tokenHash = hashToken(token);
  const hit = sessions.some((s) => s.tokenHash === tokenHash);
  if (sessions.length !== (data.sessions || []).length) {
    writeJsonAtomic(sessionsFile, { sessions });
  }
  return hit;
}

export function revokeAdminSessionToken(token) {
  if (!token || typeof token !== "string") return;
  ensureSessionsFile();
  const now = Date.now();
  const data = readRaw();
  const tokenHash = hashToken(token);
  const sessions = pruneExpired(data.sessions || [], now).filter((s) => s.tokenHash !== tokenHash);
  writeJsonAtomic(sessionsFile, { sessions });
}
