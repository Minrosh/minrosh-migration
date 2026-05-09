/**
 * File-backed admin sessions (single Node process). For PM2 cluster, containers, or HA,
 * replace with Redis/Upstash or a database and keep the same token + HMAC cookie contract.
 */
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonAtomic } from "../contact";

/** Absolute or relative dir for JSON stores; defaults to `<cwd>/data` (PM2 cwd is `.next/standalone`). */
function adminDataDir() {
  const raw = String(process.env.MINROSH_DATA_DIR || "").trim();
  if (raw) return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
  return path.join(process.cwd(), "data");
}

const sessionsFile = path.join(adminDataDir(), "admin-sessions.json");
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
 * Append a new session (multi-device / multi-user). Prunes expired rows first.
 * @param {{ email?: string | null, role?: string, userId?: string | null }} [meta]
 * @returns {{ token: string, expiresAt: number }}
 */
export function createAdminSession(meta = {}) {
  ensureSessionsFile();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = Date.now();
  const expiresAt = now + TTL_MS;
  const data = readRaw();
  let sessions = pruneExpired(data.sessions || [], now);
  const email = meta.email != null ? String(meta.email).trim().toLowerCase() : null;
  const role = String(meta.role || "super").trim().toLowerCase();
  const userId = meta.userId != null ? String(meta.userId).trim() : null;
  sessions.push({
    tokenHash,
    createdAt: now,
    expiresAt,
    email: email || null,
    role: role || "super",
    userId: userId || null,
  });
  writeJsonAtomic(sessionsFile, { sessions });
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

/**
 * @returns {{ email: string | null, role: string, userId: string | null } | null}
 */
export function getAdminSessionMetaFromRawToken(token) {
  if (!token || typeof token !== "string" || token.length !== 64) return null;
  if (!/^[a-f0-9]+$/i.test(token)) return null;
  ensureSessionsFile();
  const now = Date.now();
  const data = readRaw();
  const sessions = pruneExpired(data.sessions || [], now);
  const tokenHash = hashToken(token);
  const row = sessions.find((s) => s.tokenHash === tokenHash);
  if (!row) return null;
  const role = String(row.role || "super").trim().toLowerCase() || "super";
  return {
    email: row.email != null ? String(row.email).trim().toLowerCase() : null,
    role,
    userId: row.userId != null ? String(row.userId).trim() : null,
  };
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
