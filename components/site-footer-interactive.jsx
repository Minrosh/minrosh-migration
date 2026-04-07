"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "@/lib/whatsapp-prefill";

/**
 * Client island: live enquiry counter, newsletter subscribe bump, brand column top + stats + newsletter column.
 */
export function SiteFooterInteractive({ siteData, initialStats }) {
  const [stats, setStats] = useState(initialStats);
  const waFooter = buildWhatsAppUrl(siteData?.brand?.whatsapp, WHATSAPP_LEAD_MESSAGE);

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
            <Image src="/images/minrosh-logo.png" alt="" width={60} height={60} />
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
        <div className="site-footer__newsletter-links">
          <a href={waFooter} target="_blank" rel="noreferrer">
            WhatsApp: Chat with MinRosh
          </a>
          <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
            Alternate phone: {siteData.brand.phoneSecondary}
          </a>
        </div>
      </div>
    </>
  );
}
