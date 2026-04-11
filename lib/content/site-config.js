/**
 * Thin read adapters for extended `data/site.json` (and similar) shapes.
 * Merge strategy: spread raw first, then normalize known nested objects so new optional keys
 * never break readers when older files omit them.
 */

/**
 * @param {unknown} raw — typically imported `site.json`
 * @returns {Record<string, unknown>}
 */
export function materializeSiteConfig(raw) {
  const base = raw && typeof raw === "object" ? { ...raw } : {};
  const brandIn = base.brand && typeof base.brand === "object" ? base.brand : {};
  const socialIn = brandIn.social && typeof brandIn.social === "object" ? brandIn.social : {};
  return {
    ...base,
    schemaVersion: Number(base.schemaVersion) || 1,
    brand: {
      ...brandIn,
      social: { ...socialIn },
    },
    hero: base.hero && typeof base.hero === "object" ? { ...base.hero } : {},
    stats: Array.isArray(base.stats) ? base.stats : [],
    about: base.about && typeof base.about === "object" ? { ...base.about } : {},
    countries: base.countries && typeof base.countries === "object" ? { ...base.countries } : {},
  };
}

/**
 * @param {string} slug
 * @param {unknown} entry — hub object from destinations.json
 */
export function materializeDestinationHub(slug, entry) {
  if (!entry || typeof entry !== "object") {
    return {
      slug: String(slug || "").trim(),
      name: String(slug || "").trim(),
      sections: [],
      officialLinks: [],
    };
  }
  const e = { ...entry };
  return {
    ...e,
    slug: String(e.slug || slug || "").trim(),
    name: String(e.name || slug || "").trim(),
    sections: Array.isArray(e.sections) ? e.sections : [],
    officialLinks: Array.isArray(e.officialLinks) ? e.officialLinks : [],
  };
}
