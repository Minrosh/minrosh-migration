import Link from "next/link";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/skilled-migration", label: "Skilled Migration" },
  { href: "/partner-visa-australia", label: "Partner Visa" },
  { href: "/student-visa-australia", label: "Student Visa" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ siteData, currentPath, children }) {
  return (
    <div className="portal-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="brand" aria-label="Go to MinRosh homepage">
            <span className="brand__mark">MR</span>
            <span className="brand__text">
              <strong>{siteData.brand.name}</strong>
              <span>{siteData.brand.tagline}</span>
            </span>
          </Link>
          <nav className="site-nav site-nav--static" aria-label="Primary">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav__link ${currentPath === link.href ? "is-active" : ""}`}
                aria-current={currentPath === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/#quiz" className="btn btn-primary site-nav__cta">
              Check Eligibility
            </Link>
          </nav>
        </div>
      </header>

      <main className="portal-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <strong>{siteData.brand.name}</strong>
            <p>{siteData.brand.tagline}</p>
          </div>
          <div className="site-footer__links">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="site-footer__contact">
            <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
            <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
          </div>
        </div>
        <div className="site-footer__compliance">
          <p>
            MinRosh Migration operates under the Migration Agents Regulations 2026 and the OMARA
            Code of Conduct.
          </p>
          <p>MARN placeholder: 0000000</p>
          <a
            href="https://www.mara.gov.au/get-help-with-a-visa/help-from-registered-agents-and-lawyers/code-of-conduct/"
            target="_blank"
            rel="noreferrer"
          >
            View the OMARA Code of Conduct
          </a>
        </div>
      </footer>
    </div>
  );
}
