"use client";

import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { NewsletterForm } from "./newsletter-form";
import { SiteSocialIcons } from "./site-social-icons";

/**
 * Public footer brand column. Operational counts stay off this surface.
 */
export function SiteFooterInteractive({ brand, children }) {
  return (
    <>
      <div className="site-footer__brand-col">
        <Link href="/" className="brand footer-brand" aria-label="Go to MinRosh homepage">
          <span className="brand__mark" aria-hidden="true">
            <PublicFileImg src="/images/minrosh-logo.png" alt="MinRosh Migration logo" width={60} height={60} />
          </span>
          <span className="brand__text">
            <strong>{brand.name}</strong>
            <span>Unlock New Horizons for better tomorrow</span>
          </span>
        </Link>
        <p className="site-footer__summary">
          Clear migration information and education support for enquirers across Australia (and destination hubs worldwide).
        </p>
        <div className="site-footer__quick-contact">
          <Link href="/contact" aria-label="Open contact page for email enquiries">
            Email support via contact page
          </Link>
          <a href={`tel:${brand.phone.replace(/\s+/g, "")}`}>{brand.phone}</a>
        </div>
        <SiteSocialIcons brand={brand} variant="footer" />
      </div>

      {children}

      <div className="site-footer__newsletter">
        <strong>Newsletter</strong>
        <p>Get migration and visa updates by email.</p>
        <NewsletterForm />
      </div>
    </>
  );
}
