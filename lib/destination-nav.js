/** URL segments under /destinations/[slug]/… (must match JSON keys). */
export const DESTINATION_SECTION_IDS = [
  "skilled",
  "partner",
  "student",
  "education",
  "updates",
  "faq",
  "about",
  "contact",
];

const LABELS = {
  skilled: "Skilled",
  partner: "Partner",
  student: "Student",
  education: "Education",
  updates: "Updates",
  faq: "FAQ",
  about: "About",
  contact: "Contact",
};

export function isDestinationSectionId(section) {
  return DESTINATION_SECTION_IDS.includes(section);
}

/** Primary nav links when browsing inside a destination hub. */
export function getDestinationNavLinks(slug) {
  const base = `/destinations/${slug}`;
  return [
    { href: base, label: "Home" },
    ...DESTINATION_SECTION_IDS.map((id) => ({
      href: `${base}/${id}`,
      label: LABELS[id],
    })),
  ];
}

/** Australia uses the Sydney hero header; other destinations use a neutral/office backdrop. */
export function destinationHeaderBackdrop(slug) {
  return slug === "australia" ? "au" : "neutral";
}

export function getDestinationSectionLabel(section) {
  return LABELS[section] ?? section;
}
