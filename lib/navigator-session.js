/**
 * Persist Smart Navigator / points-quiz output so /contact and other pages can attach
 * quizSummary to the enquiry after client-side navigation (CustomEvents are same-tab only).
 */
export const NAVIGATOR_SESSION_KEY = "minrosh:lastNavigatorSummary";

/** @param {{ summary?: string, quizSummaryShort?: string }} detail */
export function persistNavigatorSummary(detail) {
  if (typeof window === "undefined" || !detail) return;
  try {
    const payload = {
      quizSummaryShort: String(detail.quizSummaryShort || "").trim(),
      summary: String(detail.summary || "").trim(),
      ts: Date.now(),
    };
    sessionStorage.setItem(NAVIGATOR_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

/** Prefer short points line; fall back to full navigator summary. Max length matches contact schema. */
export function readNavigatorQuizSummaryLine() {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(NAVIGATOR_SESSION_KEY);
    if (!raw) return "";
    const p = JSON.parse(raw);
    const line = (p.quizSummaryShort || p.summary || "").trim();
    return line.slice(0, 2000);
  } catch {
    return "";
  }
}

export function clearNavigatorSummarySession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(NAVIGATOR_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** @param {{ summary?: string, quizSummaryShort?: string }} detail */
export function quizSummaryFromNavigatorDetail(detail) {
  const s = String(detail?.quizSummaryShort || detail?.summary || "").trim();
  return s.slice(0, 2000);
}
