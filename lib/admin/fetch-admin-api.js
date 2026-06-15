const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * @param {Response} response
 */
export async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

/**
 * @param {string} operation
 * @param {string | { message?: string } | null | undefined} message
 * @param {string} [fallback]
 */
export function contextualAdminError(operation, message, fallback) {
  const detail =
    typeof message === "string"
      ? message
      : String(message?.message || fallback || "Unexpected error").trim();
  return `${operation}: ${detail}`;
}

/**
 * User-facing message for failed admin API responses.
 * @param {Response} response
 * @param {Record<string, unknown>} payload
 */
export function adminApiErrorMessage(response, payload) {
  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const msg =
    payload?.error?.message ||
    (typeof data?.error === "string" ? data.error : null) ||
    (data?.error && typeof data.error === "object" ? data.error.message : null);

  if (response.status === 401) {
    return "Your admin session has expired or you are not signed in. Please sign in again.";
  }
  if (response.status === 403) {
    return msg || "You do not have permission to perform this action.";
  }
  if (response.status === 503) {
    return msg || "Admin service is temporarily unavailable. Check server configuration.";
  }
  return msg || `Request failed (${response.status || "network error"}).`;
}

/**
 * Fetch with timeout; rejects on abort.
 * @param {string} input
 * @param {RequestInit} [init]
 * @param {number} [timeoutMs]
 */
export async function fetchAdminApi(input, init = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
