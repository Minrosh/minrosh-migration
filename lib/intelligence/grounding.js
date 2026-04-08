const OFFICIAL_HOST_PATTERNS = [
  "immi.homeaffairs.gov.au",
  "gov.uk",
  "immigration.govt.nz",
  "canada.ca",
];

function hostFromUrl(value) {
  try {
    return new URL(String(value || "")).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isOfficialSourceUrl(url) {
  const host = hostFromUrl(url);
  if (!host) return false;
  return OFFICIAL_HOST_PATTERNS.some((pattern) => host === pattern || host.endsWith(`.${pattern}`));
}

export function evaluateDraftGrounding(draft) {
  const grounding = draft?.grounding || {};
  const confidence = Number(grounding.confidence || 0);
  const sourceUrl = String(draft?.sourceUrl || grounding.sourceUrl || "").trim();
  const sourceOfficial = isOfficialSourceUrl(sourceUrl);
  const contentHashPresent = Boolean(String(grounding.contentHash || "").trim());
  const excerptPresent = Boolean(String(grounding.excerpt || draft?.summary || "").trim());
  const enoughConfidence = confidence >= 0.65;

  return {
    ok: sourceOfficial && contentHashPresent && excerptPresent && enoughConfidence,
    confidence,
    sourceOfficial,
    contentHashPresent,
    excerptPresent,
    sourceUrl,
    reason: !sourceOfficial
      ? "source_not_official"
      : !contentHashPresent
        ? "missing_content_hash"
        : !excerptPresent
          ? "missing_excerpt"
          : !enoughConfidence
            ? "low_grounding_confidence"
            : "ok",
  };
}
