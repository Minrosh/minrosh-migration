import Image from "next/image";
import Link from "next/link";
import { SiteTopbar } from "./site-topbar";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/skilled-migration", label: "Skilled Migration" },
  { href: "/partner-visa-australia", label: "Partner Visa" },
  { href: "/student-visa-australia", label: "Student Visa" },
  { href: "/education-consultation", label: "Education" },
  { href: "/updates", label: "Updates" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ siteData, currentPath, children }) {
  return (
    <div className="portal-shell">
      <SiteTopbar siteData={siteData} />
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="brand" aria-label="Go to MinRosh homepage">
            <span className="brand__mark" aria-hidden="true">
              <Image
                src="/images/minrosh-logo.png"
                alt=""
                width={46}
                height={46}
                priority
              />
            </span>
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
            <Link href="/book-consultation" className="btn btn-primary site-nav__cta">
              Book Consultation
            </Link>
            <Link href="/#quiz" className="btn btn-ghost site-nav__cta-secondary">
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
            <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
              {siteData.brand.phoneSecondary}
            </a>
          </div>
        </div>
        <div className="site-footer__compliance">
          <p>
            MinRosh Migration operates under the Migration Agents Regulations 2026 and the OMARA
            Code of Conduct.
          </p>
          <div className="site-footer__legal">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/complaints">Complaints</Link>
            <Link href="/terms-of-use">Terms of Use</Link>
            <Link href="/code-of-conduct">Code of Conduct</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
