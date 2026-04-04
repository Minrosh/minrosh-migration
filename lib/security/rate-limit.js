/**
 * Simple in-memory sliding-window rate limiter (per-process).
 * Not shared across PM2 workers or containers — use Redis/Upstash for multi-instance deployments.
 */

const buckets = new Map();

function prune(key, windowMs, max, now) {
  let arr = buckets.get(key);
  if (!arr) {
    arr = [];
    buckets.set(key, arr);
  }
  const cutoff = now - windowMs;
  while (arr.length && arr[0] < cutoff) {
    arr.shift();
  }
  if (arr.length >= max) {
    return false;
  }
  arr.push(now);
  return true;
}

/**
 * @param {string} key
 * @param {{ windowMs?: number, max?: number }} [opts]
 */
export function rateLimitAllow(key, opts = {}) {
  const windowMs = opts.windowMs ?? 15 * 60 * 1000;
  const max = opts.max ?? 12;
  const now = Date.now();
  return prune(key, windowMs, max, now);
}
