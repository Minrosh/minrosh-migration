import australia from "../data/destination-sections/australia.json";
import canada from "../data/destination-sections/canada.json";
import newZealand from "../data/destination-sections/new-zealand.json";
import unitedKingdom from "../data/destination-sections/united-kingdom.json";

export const destinationSectionPages = {
  australia,
  canada,
  "new-zealand": newZealand,
  "united-kingdom": unitedKingdom,
};

export function getDestinationSectionPage(slug, section) {
  const bucket = destinationSectionPages[slug];
  if (!bucket) return null;
  return bucket[section] ?? null;
}
