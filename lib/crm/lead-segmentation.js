function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function derivePathwaySegment({ mainNeed = "", goal = "" } = {}) {
  const combined = `${normalizeText(mainNeed)} ${normalizeText(goal)}`.trim();
  if (!combined) return "general";
  if (combined.includes("partner")) return "partner";
  if (combined.includes("student") || combined.includes("study") || combined.includes("education")) return "student";
  if (combined.includes("skilled") || combined.includes("points")) return "skilled";
  if (combined.includes("employer")) return "employer_sponsored";
  if (combined.includes("visitor") || combined.includes("tourist")) return "visitor";
  if (combined.includes("family")) return "family_complex";
  return "general";
}

export function deriveCountrySegment(preferredCountry = "") {
  const country = normalizeText(preferredCountry);
  if (!country) return "unspecified";
  if (country.includes("australia")) return "australia";
  if (country.includes("new zealand")) return "new_zealand";
  if (country.includes("canada")) return "canada";
  if (country.includes("united kingdom") || country.includes("uk")) return "united_kingdom";
  return "other";
}

export function deriveLeadSegmentation({ mainNeed = "", goal = "", preferredCountry = "", source = "" } = {}) {
  const pathwaySegment = derivePathwaySegment({ mainNeed, goal });
  const countrySegment = deriveCountrySegment(preferredCountry);
  const sourceTag = normalizeText(source).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "unknown";
  const interestTags = [`pathway:${pathwaySegment}`, `country:${countrySegment}`, `source:${sourceTag}`];
  return { pathwaySegment, countrySegment, interestTags };
}
