/**
 * In-memory daily quotas for /api/chat (per process). Pair with rateLimitAllow for burst control.
 * Set CHAT_DAILY_GLOBAL_MAX=0 to disable the global cap.
 */

function utcDayKey() {
  return new Date().toISOString().slice(0, 10);
}

const ipDayCounts = new Map();
const globalDayCounts = new Map();

function pruneStaleIpKeys(activeDay) {
  for (const k of [...ipDayCounts.keys()]) {
    if (!k.startsWith(`${activeDay}:`)) ipDayCounts.delete(k);
  }
  for (const k of [...globalDayCounts.keys()]) {
    if (k !== activeDay) globalDayCounts.delete(k);
  }
}

/**
 * @param {string} ip
 * @returns {boolean}
 */
export function chatDailyQuotaAllow(ip) {
  const day = utcDayKey();
  const maxIp = Math.max(1, Number(process.env.CHAT_DAILY_MAX_PER_IP || 80));
  const maxGlobal = Number(process.env.CHAT_DAILY_GLOBAL_MAX || 500);

  pruneStaleIpKeys(day);

  const ipKey = `${day}:${ip}`;
  const ipUsed = ipDayCounts.get(ipKey) || 0;
  if (ipUsed >= maxIp) return false;

  if (Number.isFinite(maxGlobal) && maxGlobal > 0) {
    const gUsed = globalDayCounts.get(day) || 0;
    if (gUsed >= maxGlobal) return false;
  }

  ipDayCounts.set(ipKey, ipUsed + 1);
  if (Number.isFinite(maxGlobal) && maxGlobal > 0) {
    globalDayCounts.set(day, (globalDayCounts.get(day) || 0) + 1);
  }

  return true;
}

export const CHAT_MAX_BODY_BYTES = 48 * 1024;
export const CHAT_MAX_MESSAGE_CHARS = 4000;
export const CHAT_MAX_MESSAGES = 20;
export const CHAT_MAX_TOTAL_CONTENT_CHARS = 24000;
