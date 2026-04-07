import Link from "next/link";
import { SiteFooterInteractive } from "./site-footer-interactive";

const serviceLinks = [
  { href: "/skilled-migration", label: "Skilled Migration" },
  { href: "/migration-sri-lanka-to-australia", label: "Sri Lanka → Australia" },
  { href: "/student-visa-australia", label: "Student Visas" },
  { href: "/partner-visa-australia", label: "Partner Visa" },
  { href: "/employer-sponsored-visas", label: "Employer-Sponsored" },
  { href: "/education-consultation", label: "Education Consultation" },
  { href: "/updates", label: "Visa Updates" },
];

const businessLinks = [
  { href: "/about", label: "About" },
  { href: "/assessment", label: "Free Assessment" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/complaints", label: "Complaints" },
  { href: "/code-of-conduct", label: "Code of Conduct" },
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

export function SiteFooter({ siteData, initialStats }) {
  return (
    <footer className="site-footer site-footer--rich">
      <div className="site-footer__inner site-footer__inner--rich">
        <SiteFooterInteractive siteData={siteData} initialStats={initialStats}>
          <>
            <div className="site-footer__nav-col">
              <strong>Services</strong>
              {serviceLinks.map((link) => (
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
        <div className="site-footer__notice">
          General information only. Personal circumstances should be reviewed in consultation.
        </div>
      </div>

      <div className="site-footer__badges" role="region" aria-label="Professional standards and insurance">
        <span className="site-footer__badge">Professional indemnity insured</span>
        <span className="site-footer__badge">Structured CPD — aligned with 2026 standards</span>
        <a
          className="site-footer__badge site-footer__badge--link"
          href={siteData.brand.migrationAgentsRegisterSearchUrl || "https://www.mara.gov.au/search-the-register-of-migration-agents/"}
          target="_blank"
          rel="noreferrer"
        >
          Search the Register of Migration Agents
        </a>
      </div>

      <div className="site-footer__legalbar">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
