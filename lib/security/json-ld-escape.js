/**
 * Escape characters that could break out of a JSON-LD script context if content were ever user-controlled.
 */
export function escapeJsonLdScriptJson(jsonString) {
  return String(jsonString || "").replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
