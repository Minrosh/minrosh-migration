import Image from "next/image";
import Link from "next/link";
import { SiteTopbar } from "./site-topbar";
import { SiteFooter } from "./site-footer";
import { getFooterStats } from "../lib/site-stats";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/skilled-migration", label: "Skilled Migration" },
  { href: "/partner-visa-australia", label: "Partner Visa" },
  { href: "/student-visa-australia", label: "Student Visa" },
  { href: "/education-consultation", label: "Education" },
  { href: "/updates", label: "Updates" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ siteData, currentPath, children }) {
  const footerStats = getFooterStats();

  return (
    <div className="portal-shell">
      <SiteTopbar siteData={siteData} />
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="brand" aria-label="Go to MinRosh homepage">
            <span className="brand__mark" aria-hidden="true">
              <Image
                src="/images/minrosh-logo.svg"
                alt=""
                width={46}
                height={46}
                priority
              />
            </span>
            <span className="brand__text">
              <strong>{siteData.brand.name}</strong>
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
            <Link href="/assessment" className="btn btn-ghost site-nav__cta-secondary">
              Check Eligibility
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="portal-main">{children}</main>
      <SiteFooter siteData={siteData} initialStats={footerStats} />
    </div>
  );
}
