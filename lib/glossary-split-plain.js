import { MIGRATION_GLOSSARY } from "./migration-glossary";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build regex alternation: longer phrases first; short tokens use word boundaries when flagged.
 * @returns {{ re: RegExp, entryByLower: Map<string, import('./migration-glossary.js').GlossaryEntry> }}
 */
function buildGlossaryMatcher() {
  const sorted = [...MIGRATION_GLOSSARY].sort((a, b) => b.phrase.length - a.phrase.length);
  /** @type {Map<string, import('./migration-glossary.js').GlossaryEntry>} */
  const entryByLower = new Map();
  const parts = sorted.map((entry) => {
    entryByLower.set(entry.phrase.toLowerCase(), entry);
    const escaped = escapeRegExp(entry.phrase);
    const useWordBoundary =
      entry.word === true ||
      (entry.phrase.length <= 4 && /^[0-9A-Za-z]+$/.test(entry.phrase));
    if (useWordBoundary) {
      return `(?<!\\w)${escaped}(?!\\w)`;
    }
    return escaped;
  });
  const body = parts.join("|");
  const re = new RegExp(`(${body})`, "gi");
  return { re, entryByLower };
}

let cached = null;
function getMatcher() {
  if (!cached) cached = buildGlossaryMatcher();
  return cached;
}

/**
 * Split plain text into segments for glossary UI (no React dependency).
 * @param {string} text
 * @returns {{ type: 'text' | 'term'; text: string; definition?: string }[]}
 */
export function buildGlossaryParts(text) {
  const raw = String(text || "");
  if (!raw) return [{ type: "text", text: "" }];
  const { re, entryByLower } = getMatcher();
  const segments = raw.split(re);
  /** @type {{ type: 'text' | 'term'; text: string; definition?: string }[]} */
  const out = [];
  for (let i = 0; i < segments.length; i += 1) {
    const piece = segments[i];
    if (piece === undefined || piece === "") continue;
    const entry = entryByLower.get(piece.toLowerCase());
    if (entry) {
      out.push({ type: "term", text: piece, definition: entry.definition });
    } else {
      out.push({ type: "text", text: piece });
    }
  }
  return out.length ? out : [{ type: "text", text: raw }];
}
