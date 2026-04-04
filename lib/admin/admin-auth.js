import { createHash, timingSafeEqual } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "../contact";
import { adminAuthFile } from "./paths";

const PLACEHOLDER_PASSWORDS = new Set(["change-me-strong-password", "your-strong-password-here"]);

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

function getStoredHash() {
  const cfg = readAuthConfig();
  const hash = String(cfg?.passwordHash || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(hash) ? hash : "";
}

export function getAdminCredentialMaterial() {
  const envPassword = safeEnvPassword();
  const storedHash = getStoredHash();
  if (envPassword && !isPlaceholder(envPassword)) {
    return `env:${envPassword}`;
  }
  if (storedHash) {
    return `hash:${storedHash}`;
  }
  if (envPassword) {
    return `env:${envPassword}`;
  }
  return "";
}

export function hasAdminPasswordConfigured() {
  return Boolean(getAdminCredentialMaterial());
}

export function verifyAdminPassword(inputPassword) {
  const input = String(inputPassword || "");
  if (!input) return false;

  const envPassword = safeEnvPassword();
  const storedHash = getStoredHash();

  if (envPassword && !isPlaceholder(envPassword)) {
    return input === envPassword;
  }

  if (storedHash) {
    const actual = Buffer.from(sha256Hex(input), "hex");
    const expected = Buffer.from(storedHash, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
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
  writeJsonAtomic(adminAuthFile, { passwordHash: sha256Hex(password), updatedAt: now });
  return { updatedAt: now };
}
