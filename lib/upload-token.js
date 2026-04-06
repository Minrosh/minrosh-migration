/**
 * Magic upload URLs use Node randomUUID() (36 chars, hyphenated hex).
 * Reject pathological tokens before touching customer data or crypto.
 */
export function normalizeUploadTokenParam(raw) {
  const t = String(raw || "").trim();
  if (t.length !== 36) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return null;
  return t.toLowerCase();
}
