import Link from "next/link";
import { SiteFooterInteractive } from "./site-footer-interactive";

const serviceLinks = [
  { href: "/skilled-migration", label: "Skilled Migration" },
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
        <SiteFooterInteractive siteData={siteData} initialStats={initialStats} />

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

      <div className="site-footer__trust-mandatory" role="region" aria-label="Registration and regulatory alignment">
        <p>
          <strong>Registered with OMARA. Code of Conduct compliant. TSMIT 2026 indexed.</strong> Confirm the current
          Temporary Skilled Migration Income Threshold on the Department of Home Affairs website before relying on any
          number for employer-sponsored planning.
        </p>
      </div>

      <div className="site-footer__compliance" role="region" aria-label="Migration agent registration">
        <p className="site-footer__compliance-lead">
          {siteData.brand.marn ? (
            <>
              <strong>Migration Agents Registration Number (MARN):</strong> {siteData.brand.marn}.{" "}
            </>
          ) : (
            <>
              <strong>Registered migration agent:</strong> Add your MARN in{" "}
              <code className="site-footer__code">data/site.json</code> under{" "}
              <code className="site-footer__code">brand.marn</code>.{" "}
            </>
          )}
          <a
            href={
              siteData.brand.migrationAgentsRegulations2026Url ||
              "https://www.legislation.gov.au/F2026L00118/latest"
            }
            target="_blank"
            rel="noreferrer"
          >
            Migration Agents Regulations 2026
          </a>
          {" · "}
          <a
            href={
              siteData.brand.omaraCodeOfConductUrl ||
              "https://www.mara.gov.au/tools-for-agents/legislation/code-of-conduct"
            }
            target="_blank"
            rel="noreferrer"
          >
            OMARA Code of Conduct
          </a>
          {" · "}
          <a
            href={siteData.brand.omaraLegislativeUpdatesUrl || "https://www.mara.gov.au/notices-and-reports/news-and-notices/legislative-updates"}
            target="_blank"
            rel="noreferrer"
          >
            OMARA legislative updates
          </a>
          {" · "}
          <a href={siteData.brand.omaraRegisterUrl || "https://www.mara.gov.au/"} target="_blank" rel="noreferrer">
            OMARA register
          </a>
        </p>
        {siteData.brand.specialistAccreditationNote ? (
          <p className="site-footer__compliance-sub">{siteData.brand.specialistAccreditationNote}</p>
        ) : null}
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
