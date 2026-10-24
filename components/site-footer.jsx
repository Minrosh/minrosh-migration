import Link from "next/link";
import { FOOTER_SERVICE_LINKS } from "../lib/public-indexable-routes";
import { getComplianceConfig } from "../lib/compliance";
import { SiteFooterInteractive } from "./site-footer-interactive";

const serviceLinks = FOOTER_SERVICE_LINKS;

const businessLinks = [
  { href: "/about", label: "About" },
  { href: "/assessment", label: "Information Finder" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const destinationLinks = [
  { href: "/destinations/australia", label: "Australia" },
  { href: "/destinations/new-zealand", label: "New Zealand" },
  { href: "/destinations/canada", label: "Canada" },
  { href: "/destinations/united-kingdom", label: "United Kingdom" },
];

export function SiteFooter({ siteData }) {
  const publicBrand = { ...siteData.brand, email: "" };
  const compliance = getComplianceConfig(siteData);
  const homeAffairsUrl = compliance.homeAffairsUrl || "https://immi.homeaffairs.gov.au/";
  const maraSearchUrl =
    siteData?.brand?.migrationAgentsRegisterSearchUrl ||
    compliance.authorisedProfessionalReferralUrl ||
    "https://www.mara.gov.au/search-the-register-of-migration-agents/";

  const legalLinks = [
    { href: "/disclaimer", label: "General Information Disclaimer" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
    { href: homeAffairsUrl, label: "Official Home Affairs Website", external: true },
    {
      href: maraSearchUrl,
      label: compliance.authorisedProfessionalReferralLabel || "Find a Registered Migration Agent",
      external: true,
    },
    { href: "/code-of-conduct", label: "OMARA Code of Conduct (reference)" },
    { href: "/complaints", label: "Complaints" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ];

  const noticeText =
    compliance.businessStatusDisclosure ||
    "MinRosh Migration provides general information based on publicly available sources and education-related support. We are not registered migration agents or Australian legal practitioners and do not provide immigration assistance.";

  return (
    <footer className="site-footer site-footer--rich">
      <div className="site-footer__inner site-footer__inner--rich">
        <SiteFooterInteractive brand={publicBrand}>
          <>
            <div className="site-footer__nav-col">
              <strong>Services</strong>
              {serviceLinks.slice(0, 7).map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="site-footer__nav-col">
              <strong>Visa Guides</strong>
              {serviceLinks.slice(7).map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="site-footer__nav-col">
              <strong>Destinations</strong>
              {destinationLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="site-footer__nav-col">
              <strong>Business</strong>
              {businessLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        </SiteFooterInteractive>
      </div>

      <div className="site-footer__notice-wrap">
        <div className="site-footer__notice" role="note">
          <strong className="block mb-1">Important notice</strong>
          {noticeText}
        </div>
      </div>

      <div className="site-footer__legalbar">
        {legalLinks.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          )
        )}
      </div>
    </footer>
  );
}
