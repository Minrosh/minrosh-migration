/**
 * Persistent daily SMTP send counter (file-backed) to limit abuse via public forms.
 * Complements per-IP rate limits; not shared across hosts unless SMTP_SEND_CAP_FILE points to shared storage.
 */
import fs from "node:fs";
import path from "node:path";
import { withMutationLock } from "../json-mutation-lock";

const capFile =
  process.env.SMTP_SEND_CAP_FILE || path.join(process.cwd(), "data", ".smtp-daily-send.json");

function lockPath() {
  return `${capFile}.lock`;
}

function todayUtcKey() {
  return new Date().toISOString().slice(0, 10);
}

function maxDaily() {
  const raw = String(process.env.SMTP_DAILY_SEND_MAX ?? "400").trim();
  if (raw === "0" || raw.toLowerCase() === "false") return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 400;
}

function capDisabled() {
  return maxDaily() === 0;
}

function readState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(capFile, "utf8"));
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* fresh state */
  }
  return { date: "", count: 0 };
}

function writeState(state) {
  fs.mkdirSync(path.dirname(capFile), { recursive: true });
  const temp = `${capFile}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(state)}\n`, "utf8");
  fs.renameSync(temp, capFile);
}

/**
 * @param {number} [additional=1]
 * @returns {{ allowed: boolean, count: number, max: number, date: string }}
 */
export function checkSmtpDailySendCap(additional = 1) {
  const max = maxDaily();
  const date = todayUtcKey();
  if (capDisabled()) {
    return { allowed: true, count: 0, max: 0, date };
  }
  const need = Math.max(1, Math.floor(Number(additional) || 1));
  const state = readState();
  const count = state.date === date ? Number(state.count) || 0 : 0;
  return {
    allowed: count + need <= max,
    count,
    max,
    date,
  };
}

/** @param {number} [count=1] */
export function recordSmtpDailySend(count = 1) {
  if (capDisabled()) return;
  const inc = Math.max(1, Math.floor(Number(count) || 1));
  const date = todayUtcKey();
  withMutationLock(lockPath(), () => {
    const state = readState();
    const base = state.date === date ? Number(state.count) || 0 : 0;
    writeState({ date, count: base + inc });
  });
}
