import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { readJsonFile, writeJsonAtomic } from "../contact";
import { adminAuthFile } from "./paths";

const PLACEHOLDER_PASSWORDS = new Set(["change-me-strong-password", "your-strong-password-here"]);
const BCRYPT_ROUNDS = 12;

function sha256Hex(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function safeEnvPassword() {
  const raw = String(process.env.ADMIN_PASSWORD || "").trim();
  if (!raw) return "";
  return raw;
}

function isPlaceholder(password) {
  return PLACEHOLDER_PASSWORDS.has(String(password || "").trim().toLowerCase());
}

function readAuthConfig() {
  return readJsonFile(adminAuthFile, {});
}

function getStoredRecord() {
  const cfg = readAuthConfig();
  const hash = String(cfg?.passwordHash || "").trim();
  const algo = String(cfg?.algo || "").toLowerCase();
  if (!hash) return null;
  return { hash, algo };
}

export function getAdminCredentialMaterial() {
  const envPassword = safeEnvPassword();
  const stored = getStoredRecord();
  if (envPassword && !isPlaceholder(envPassword)) {
    return `env:${envPassword}`;
  }
  if (stored) {
    return `hash:${stored.hash}`;
  }
  if (envPassword) {
    return `env:${envPassword}`;
  }
  return "";
}

export function hasAdminPasswordConfigured() {
  return Boolean(getAdminCredentialMaterial());
}

function verifyLegacySha256(inputPassword, storedHash) {
  const actual = Buffer.from(sha256Hex(inputPassword), "hex");
  const expected = Buffer.from(String(storedHash).toLowerCase(), "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function verifyAdminPassword(inputPassword) {
  const input = String(inputPassword || "");
  if (!input) return false;

  const envPassword = safeEnvPassword();
  const stored = getStoredRecord();

  if (envPassword && !isPlaceholder(envPassword)) {
    return input === envPassword;
  }

  if (stored) {
    if (stored.algo === "bcrypt" || stored.hash.startsWith("$2")) {
      return bcrypt.compareSync(input, stored.hash);
    }
    if (stored.algo === "sha256" || /^[a-f0-9]{64}$/i.test(stored.hash)) {
      return verifyLegacySha256(input, stored.hash);
    }
  }

  if (envPassword) return input === envPassword;
  return false;
}

export function setAdminPassword(newPassword) {
  const password = String(newPassword || "").trim();
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  writeJsonAtomic(adminAuthFile, {
    passwordHash,
    algo: "bcrypt",
    updatedAt: now,
  });
  return { updatedAt: now };
}
