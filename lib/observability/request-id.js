export const REQUEST_ID_HEADER = "x-request-id";

function createRequestId() {
  try {
    if (globalThis?.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    // noop
  }
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 12);
  return `${now}-${rand}`;
}

export function normalizeRequestId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.slice(0, 128);
}

export function getOrCreateRequestId(request) {
  const inbound = normalizeRequestId(request?.headers?.get?.(REQUEST_ID_HEADER));
  return inbound || createRequestId();
}

export function getRequestIdFromHeaders(headersLike) {
  try {
    return normalizeRequestId(headersLike?.get?.(REQUEST_ID_HEADER));
  } catch {
    return "";
  }
}
