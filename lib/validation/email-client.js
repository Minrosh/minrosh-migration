/**
 * Browser-safe email shape check aligned with `isValidEmailLinear` (no CRLF, linear scan).
 * @param {string} value
 */
export function isValidEmailClient(value) {
  const v = String(value || "").trim();
  if (!v || v.length > 254) return false;
  if (/[\r\n]/.test(v)) return false;
  const at = v.indexOf("@");
  if (at < 1) return false;
  if (v.indexOf("@", at + 1) !== -1) return false;
  const local = v.slice(0, at);
  const domain = v.slice(at + 1);
  if (!local.length || local.length > 64) return false;
  if (!domain.length || domain.length > 253) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  if (!domain.includes(".")) return false;
  const dot = domain.lastIndexOf(".");
  if (dot < 1 || dot === domain.length - 1) return false;
  return true;
}
