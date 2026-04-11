"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { NewsletterForm } from "./newsletter-form";
import { SiteSocialIcons } from "./site-social-icons";

/**
 * Client island: brand + stats, optional middle columns (nav), newsletter last.
 */
export function SiteFooterInteractive({ siteData, initialStats, children }) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    function handleEnquiryCreated() {
      setStats((current) => ({ ...current, enquiryCount: current.enquiryCount + 1 }));
    }
    window.addEventListener("minrosh:enquiry-created", handleEnquiryCreated);
    return () => window.removeEventListener("minrosh:enquiry-created", handleEnquiryCreated);
  }, []);

  return (
    <>
      <div className="site-footer__brand-col">
        <Link href="/" className="brand footer-brand" aria-label="Go to MinRosh homepage">
          <span className="brand__mark" aria-hidden="true">
            <PublicFileImg src="/images/minrosh-logo.jpg" alt="" width={60} height={60} />
          </span>
          <span className="brand__text">
            <strong>{siteData.brand.name}</strong>
            <span>Unlock New Horizons for better tomorrow</span>
          </span>
        </Link>
        <p className="site-footer__summary">
          Clear migration and education guidance for Brisbane and Australia-wide clients.
        </p>
        <div className="site-footer__quick-contact">
          <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
          <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
        </div>
        <SiteSocialIcons brand={siteData.brand} variant="footer" />
        <div className="site-footer__stats">
          <div className="site-footer__stat">
            <strong>{stats.enquiryCount}</strong>
            <span>Enquiry count</span>
          </div>
          <div className="site-footer__stat">
            <strong>{stats.newsletterCount}</strong>
            <span>Newsletter signups</span>
          </div>
          <div className="site-footer__stat">
            <strong>{stats.updatesCount}</strong>
            <span>Updates tracked</span>
          </div>
        </div>
      </div>

      {children}

      <div className="site-footer__newsletter">
        <strong>Newsletter</strong>
        <p>Get migration and visa updates by email.</p>
        <NewsletterForm
          onSubscribed={() =>
            setStats((current) => ({
              ...current,
              newsletterCount: current.newsletterCount + 1,
            }))
          }
        />
      </div>
    </>
  );
}
