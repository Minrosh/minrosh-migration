import lifestyleGuides from "../data/lifestyle-guides.json";

/** @param {string} key */
export function getLifestyleGuide(key) {
  return lifestyleGuides[key] ?? null;
}
