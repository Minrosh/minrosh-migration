import Image from "next/image";
import Link from "next/link";
import { SiteTopbar } from "./site-topbar";
import { SiteFooter } from "./site-footer";
import { getFooterStats } from "../lib/site-stats";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/skilled-migration", label: "Skilled" },
  { href: "/partner-visa-australia", label: "Partner" },
  { href: "/student-visa-australia", label: "Student" },
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
                src="/images/minrosh-logo.png"
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
            <div className="site-nav__group site-nav__group--main">
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
            </div>
            <div className="site-nav__group site-nav__group--actions">
              <Link href="/book-consultation" className="btn btn-primary site-nav__cta">
                Book Consultation
              </Link>
              <Link href="/assessment" className="btn btn-ghost site-nav__cta-secondary">
                Check Eligibility
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="portal-main">{children}</main>
      <SiteFooter siteData={siteData} initialStats={footerStats} />
    </div>
  );
}
