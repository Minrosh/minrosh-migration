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

/**
 * Primary nav links when browsing inside a destination area.
 * "Home" always returns visitors to the main site landing (/) — not the destination hub.
 * Use the top bar country links to reopen a destination hub (/destinations/…).
 */
export function getDestinationNavLinks(slug) {
  const base = `/destinations/${slug}`;
  return [
    { href: "/#home", label: "Home" },
    ...DESTINATION_SECTION_IDS.map((id) => ({
      href: `${base}/${id}`,
      label: LABELS[id],
    })),
  ];
}

/** Australia hub uses the Brisbane-marketing backdrop key; other destinations use a neutral/office backdrop. */
export function destinationHeaderBackdrop(slug) {
  return slug === "australia" ? "au" : "neutral";
}

export function getDestinationSectionLabel(section) {
  return LABELS[section] ?? section;
}
