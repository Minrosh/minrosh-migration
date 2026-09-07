/**
 * Guard invoice / quote line descriptions so they cannot claim immigration assistance,
 * lodgement, or visa application preparation (no-MARN compliance).
 */

const PROHIBITED_INVOICE_LINE_PATTERNS = [
  /\bimmigration\s+assistance\b/i,
  /\bvisa\s+application\s+preparation\b/i,
  /\bprepar(e|ing|ation)\s+(of\s+)?(a\s+|your\s+|the\s+)?visa\b/i,
  /\blodge(ment|d|s)?\s+(of\s+)?(a\s+|your\s+|the\s+)?visa\b/i,
  /\bvisa\s+lodgement\b/i,
  /\blodge(ment)?\s+(with\s+)?(home\s+affairs|immi|department)\b/i,
  /\bmigration\s+(advice|assistance|representation)\b/i,
  /\brepresent(ation|ing)?\s+(before\s+)?(home\s+affairs|aatro|tribunal)\b/i,
  /\bauthorised\s+recipient\b/i,
  /\bvisa\s+strategy\s+(advice|consult)/i,
  /\beligibility\s+assessment\s+(for\s+)?visa\b/i,
  /\bpoints\s+assessment\s+(service|fee)\b/i,
  /\bMARN\b/,
  /\bregistered\s+migration\s+agent\b/i,
];

/**
 * @param {string} text
 * @returns {{ ok: true } | { ok: false, matches: string[] }}
 */
export function validateInvoiceLineDescription(text) {
  const source = String(text || "");
  const matches = [];
  for (const pattern of PROHIBITED_INVOICE_LINE_PATTERNS) {
    const found = source.match(pattern);
    if (found) matches.push(found[0]);
  }
  if (matches.length) return { ok: false, matches };
  return { ok: true };
}

/**
 * @param {Array<{ description?: string, label?: string }>} lines
 * @returns {{ ok: true } | { ok: false, violations: Array<{ index: number, description: string, matches: string[] }> }}
 */
export function validateInvoiceLineDescriptions(lines) {
  const list = Array.isArray(lines) ? lines : [];
  const violations = [];
  list.forEach((line, index) => {
    const description = String(line?.description || line?.label || "").trim();
    if (!description) return;
    const result = validateInvoiceLineDescription(description);
    if (!result.ok) {
      violations.push({ index, description, matches: result.matches });
    }
  });
  if (violations.length) return { ok: false, violations };
  return { ok: true };
}

/** Safe fallback label when a prohibited phrase must be rewritten (sanitize path). */
export const SAFE_INVOICE_LINE_FALLBACK = "Education support / general information services";

/**
 * Replace prohibited descriptions with a compliant fallback; leave others unchanged.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeInvoiceLineDescription(text) {
  const source = String(text || "").trim();
  if (!source) return source;
  const result = validateInvoiceLineDescription(source);
  if (!result.ok) return SAFE_INVOICE_LINE_FALLBACK;
  return source;
}
