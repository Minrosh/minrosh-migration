import { createHash, randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { readJsonFile, writeJsonAtomic } from "../contact";
import { withMutationLock } from "../json-mutation-lock";
import { adminUsersFile } from "./paths";
import { ADMIN_ACCOUNT_ROLES } from "./permissions";
import { adminUserError } from "./admin-user-errors";

const BCRYPT_ROUNDS = 12;
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;

function lockPath() {
  return `${adminUsersFile}.lock`;
}

function sha256Hex(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

function ensureUsersFile() {
  if (fs.existsSync(adminUsersFile)) return;
  fs.mkdirSync(path.dirname(adminUsersFile), { recursive: true });
  writeJsonAtomic(adminUsersFile, { users: [] });
}

function readUsersRaw() {
  ensureUsersFile();
  return readJsonFile(adminUsersFile, { users: [] });
}

function toPublicUser(row) {
  if (!row) return null;
  const { passwordHash: _p, verificationTokenHash: _t, ...rest } = row;
  return rest;
}

function isEmailVerified(row) {
  return row.emailVerified !== false;
}

export function listAdminUsersPublic() {
  const { users = [] } = readUsersRaw();
  return users.map((u) => toPublicUser(u));
}

/**
 * @returns {{ ok: true, user: { id: string, email: string, role: string } } | { ok: false, reason: "invalid" | "unverified" }}
 */
export function checkAdminUserLogin(email, password) {
  const { users = [] } = readUsersRaw();
  const norm = String(email || "").trim().toLowerCase();
  const row = users.find((u) => String(u.email || "").toLowerCase() === norm);
  if (!row?.passwordHash) return { ok: false, reason: "invalid" };
  if (!bcrypt.compareSync(String(password || ""), String(row.passwordHash))) {
    return { ok: false, reason: "invalid" };
  }
  if (!isEmailVerified(row)) {
    return { ok: false, reason: "unverified" };
  }
  return {
    ok: true,
    user: { id: String(row.id), email: String(row.email).toLowerCase(), role: String(row.role || "admin") },
  };
}

/** @deprecated use checkAdminUserLogin */
export function verifyAdminUserPassword(email, password) {
  const r = checkAdminUserLogin(email, password);
  return r.ok ? r.user : null;
}

function countSupers(users) {
  return users.filter((u) => String(u.role || "").toLowerCase() === "super").length;
}

function issueVerificationFields() {
  const plainToken = randomBytes(32).toString("hex");
  const verificationTokenHash = sha256Hex(plainToken);
  const verificationExpiresAt = new Date(Date.now() + VERIFY_TTL_MS).toISOString();
  return { plainToken, verificationTokenHash, verificationExpiresAt };
}

/**
 * @returns {{ user: object, plainVerificationToken: string }}
 */
export function createAdminUser({ email, password, role }) {
  const em = String(email || "").trim().toLowerCase();
  const pw = String(password || "");
  const r = String(role || "admin").trim().toLowerCase();
  if (!em || !pw || pw.length < 8) {
    throw adminUserError("VALIDATION_FAILED", "Email and password (min 8 chars) are required.");
  }
  if (!ADMIN_ACCOUNT_ROLES.includes(r)) {
    throw adminUserError("VALIDATION_FAILED", "Invalid role.");
  }
  return withMutationLock(lockPath(), () => {
    const data = readJsonFile(adminUsersFile, { users: [] });
    const users = Array.isArray(data.users) ? [...data.users] : [];
    if (users.some((u) => String(u.email || "").toLowerCase() === em)) {
      throw adminUserError("CONFLICT", "An admin with that email already exists.");
    }
    const { plainToken, verificationTokenHash, verificationExpiresAt } = issueVerificationFields();
    const row = {
      id: randomUUID(),
      email: em,
      role: r,
      passwordHash: bcrypt.hashSync(pw, BCRYPT_ROUNDS),
      createdAt: new Date().toISOString(),
      emailVerified: false,
      verificationTokenHash,
      verificationExpiresAt,
    };
    users.push(row);
    writeJsonAtomic(adminUsersFile, { users });
    return { user: toPublicUser(row), plainVerificationToken: plainToken };
  });
}

/**
 * @returns {{ ok: true, email: string } | { ok: false, reason: "invalid" | "expired" }}
 */
export function confirmAdminEmailToken(plainToken) {
  const raw = String(plainToken || "").trim();
  if (!raw) return { ok: false, reason: "invalid" };
  const h = sha256Hex(raw);
  return withMutationLock(lockPath(), () => {
    const data = readJsonFile(adminUsersFile, { users: [] });
    const users = Array.isArray(data.users) ? [...data.users] : [];
    const idx = users.findIndex((u) => String(u.verificationTokenHash || "") === h);
    if (idx === -1) return { ok: false, reason: "invalid" };
    const u = users[idx];
    const exp = u.verificationExpiresAt ? new Date(u.verificationExpiresAt).getTime() : 0;
    if (!exp || Date.now() > exp) return { ok: false, reason: "expired" };
    const email = String(u.email || "");
    const nextRow = { ...u, emailVerified: true };
    delete nextRow.verificationTokenHash;
    delete nextRow.verificationExpiresAt;
    users[idx] = nextRow;
    writeJsonAtomic(adminUsersFile, { users });
    return { ok: true, email };
  });
}

/** @returns {{ plainVerificationToken: string, email: string }} */
export function regenerateAdminVerificationToken(userId) {
  const uid = String(userId || "").trim();
  if (!uid) throw adminUserError("VALIDATION_FAILED", "Missing user id.");
  return withMutationLock(lockPath(), () => {
    const data = readJsonFile(adminUsersFile, { users: [] });
    const users = Array.isArray(data.users) ? [...data.users] : [];
    const idx = users.findIndex((u) => String(u.id) === uid);
    if (idx === -1) throw adminUserError("NOT_FOUND", "User not found.");
    const u = users[idx];
    if (isEmailVerified(u)) {
      throw adminUserError("CONFLICT", "This account is already verified.");
    }
    const { plainToken, verificationTokenHash, verificationExpiresAt } = issueVerificationFields();
    users[idx] = {
      ...u,
      verificationTokenHash,
      verificationExpiresAt,
    };
    writeJsonAtomic(adminUsersFile, { users });
    return { plainVerificationToken: plainToken, email: String(u.email || "") };
  });
}

export function updateAdminUser(id, { password, role }) {
  const uid = String(id || "").trim();
  if (!uid) throw adminUserError("VALIDATION_FAILED", "Missing user id.");
  return withMutationLock(lockPath(), () => {
    const data = readJsonFile(adminUsersFile, { users: [] });
    const users = Array.isArray(data.users) ? [...data.users] : [];
    const idx = users.findIndex((u) => String(u.id) === uid);
    if (idx === -1) throw adminUserError("NOT_FOUND", "User not found.");
    const next = { ...users[idx] };
    if (password != null) {
      const pw = String(password).trim();
      if (pw.length < 8) throw adminUserError("VALIDATION_FAILED", "Password must be at least 8 characters.");
      next.passwordHash = bcrypt.hashSync(pw, BCRYPT_ROUNDS);
    }
    if (role != null) {
      const r = String(role).trim().toLowerCase();
      if (!ADMIN_ACCOUNT_ROLES.includes(r)) throw adminUserError("VALIDATION_FAILED", "Invalid role.");
      const wasSuper = String(users[idx].role || "").toLowerCase() === "super";
      if (wasSuper && r !== "super" && countSupers(users) <= 1) {
        throw adminUserError("CONFLICT", "Cannot demote the only super admin.");
      }
      next.role = r;
    }
    users[idx] = next;
    writeJsonAtomic(adminUsersFile, { users });
    return toPublicUser(next);
  });
}

export function deleteAdminUser(id) {
  const uid = String(id || "").trim();
  if (!uid) throw adminUserError("VALIDATION_FAILED", "Missing user id.");
  return withMutationLock(lockPath(), () => {
    const data = readJsonFile(adminUsersFile, { users: [] });
    const users = Array.isArray(data.users) ? [...data.users] : [];
    const idx = users.findIndex((u) => String(u.id) === uid);
    if (idx === -1) throw adminUserError("NOT_FOUND", "User not found.");
    const target = users[idx];
    if (String(target.role || "").toLowerCase() === "super" && countSupers(users) <= 1) {
      throw adminUserError("CONFLICT", "Cannot delete the only super admin.");
    }
    users.splice(idx, 1);
    writeJsonAtomic(adminUsersFile, { users });
    return { ok: true };
  });
}
