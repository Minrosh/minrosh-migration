import {
  FOOTER_SERVICE_LINKS,
  GLOBAL_HEADER_PRIMARY_LINKS,
} from "@/lib/public-indexable-routes";

/** @typedef {{ label: string, href: string }} ChromeLink */
/** @typedef {{ title: string, links: ChromeLink[] }} ChromeLinkGroup */

export const LEGACY_HEADER_CTA = {
  label: "Book consultation",
  href: "/book-consultation",
};

export const LEGACY_FOOTER_DESTINATION_LINKS = [
  { href: "/destinations/australia", label: "Australia" },
  { href: "/destinations/new-zealand", label: "New Zealand" },
  { href: "/destinations/canada", label: "Canada" },
  { href: "/destinations/united-kingdom", label: "United Kingdom" },
];

export const LEGACY_FOOTER_BUSINESS_LINKS = [
  { href: "/about", label: "About" },
  { href: "/assessment", label: "Free Assessment" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const LEGACY_FOOTER_LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/complaints", label: "Complaints" },
  { href: "/code-of-conduct", label: "Code of Conduct" },
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

export const LEGACY_FOOTER_NOTICE =
  "General information only. Personal circumstances should be reviewed in consultation.";

export const LEGACY_FOOTER_TAGLINE = "Unlock New Horizons for better tomorrow";

export const LEGACY_FOOTER_SUMMARY =
  "Clear migration and education guidance for clients across Australia (and destination hubs worldwide).";

/** Default footer nav columns (legacy layout). */
export function getLegacyFooterLinkGroups() {
  const serviceLinks = FOOTER_SERVICE_LINKS;
  return [
    { title: "Services", links: serviceLinks.slice(0, 7) },
    { title: "Visa Guides", links: serviceLinks.slice(7) },
    { title: "Destinations", links: LEGACY_FOOTER_DESTINATION_LINKS },
    { title: "Business", links: LEGACY_FOOTER_BUSINESS_LINKS },
  ];
}

/** Full legacy chrome snapshot for fallback rendering. */
export function getLegacySiteChrome() {
  return {
    primaryLinks: GLOBAL_HEADER_PRIMARY_LINKS,
    headerCta: LEGACY_HEADER_CTA,
    footerLinkGroups: getLegacyFooterLinkGroups(),
    legalLinks: LEGACY_FOOTER_LEGAL_LINKS,
    footerNotice: LEGACY_FOOTER_NOTICE,
    footerTagline: LEGACY_FOOTER_TAGLINE,
    footerSummary: LEGACY_FOOTER_SUMMARY,
    contactPhone: "",
    contactEmailLabel: "",
    socialOverrides: null,
    showMarn: false,
    marnText: "Available on request",
    disclaimerText: "",
    footerComplianceWording: "",
    fromCms: false,
  };
}
