const NEGATIVE_HINTS = [
  "confused",
  "unclear",
  "not clear",
  "angry",
  "frustrated",
  "wrong info",
  "fake",
  "misleading",
  "scam",
  "bad advice",
];

export function basicSentimentSignal(text) {
  const body = String(text || "").toLowerCase();
  const hits = NEGATIVE_HINTS.filter((term) => body.includes(term));
  const score = hits.length;
  return {
    score,
    negative: score >= 2,
    labels: hits,
  };
}
