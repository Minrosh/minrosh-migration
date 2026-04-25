"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { NewsletterForm } from "./newsletter-form";
import { SiteSocialIcons } from "./site-social-icons";

/**
 * Client island: brand + stats, optional middle columns (nav), newsletter last.
 */
export function SiteFooterInteractive({ brand, initialStats, children }) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    let cancelled = false;

    async function refreshStats() {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) return;
        const rawText = await response.text();
        let payload;
        try {
          payload = rawText ? JSON.parse(rawText) : {};
        } catch {
          return;
        }
        const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        if (cancelled) return;
        setStats((current) => ({
          ...current,
          enquiryCount: Number.isFinite(data?.enquiryCount) ? data.enquiryCount : current.enquiryCount,
          newsletterCount: Number.isFinite(data?.newsletterCount)
            ? data.newsletterCount
            : current.newsletterCount,
          updatesCount: Number.isFinite(data?.updatesCount) ? data.updatesCount : current.updatesCount,
        }));
      } catch {
        // Keep server-rendered initial stats if refresh fails.
      }
    }

    refreshStats();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <PublicFileImg src="/images/minrosh-logo.png" alt="" width={60} height={60} />
          </span>
          <span className="brand__text">
            <strong>{brand.name}</strong>
            <span>Unlock New Horizons for better tomorrow</span>
          </span>
        </Link>
        <p className="site-footer__summary">
          Clear migration and education guidance for clients across Australia (and destination hubs worldwide).
        </p>
        <div className="site-footer__quick-contact">
          <Link href="/contact" aria-label="Open contact page for email enquiries">
            Email support via contact page
          </Link>
          <a href={`tel:${brand.phone.replace(/\s+/g, "")}`}>{brand.phone}</a>
        </div>
        <SiteSocialIcons brand={brand} variant="footer" />
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
