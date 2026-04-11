export const OFFICIAL_SOURCE_HOSTS_BY_DESTINATION = {
  australia: [
    "immi.homeaffairs.gov.au",
  ],
  canada: [
    "www.canada.ca",
    "canada.ca",
  ],
  "new-zealand": [
    "www.immigration.govt.nz",
    "immigration.govt.nz",
  ],
  "united-kingdom": [
    "www.gov.uk",
    "gov.uk",
  ],
};

export function isOfficialSourceHostAllowed(destinationSlug, href) {
  try {
    const url = new URL(href);
    const allowedHosts = OFFICIAL_SOURCE_HOSTS_BY_DESTINATION[destinationSlug] ?? [];
    return allowedHosts.includes(url.hostname);
  } catch {
    return false;
  }
}
