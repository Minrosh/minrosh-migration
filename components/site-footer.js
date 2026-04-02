"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

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
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await fetch("/api/stats", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data?.ok) {
          setStats({
            enquiryCount: Number(data.enquiryCount || 0),
            newsletterCount: Number(data.newsletterCount || 0),
            updatesCount: Number(data.updatesCount || 0),
          });
        }
      } catch {
        // Keep server-rendered stats if live fetch is unavailable.
      }
    }

    loadStats();

    function handleEnquiryCreated() {
      setStats((current) => ({ ...current, enquiryCount: current.enquiryCount + 1 }));
    }

    window.addEventListener("minrosh:enquiry-created", handleEnquiryCreated);
    return () => {
      cancelled = true;
      window.removeEventListener("minrosh:enquiry-created", handleEnquiryCreated);
    };
  }, []);

  return (
    <footer className="site-footer site-footer--rich">
      <div className="site-footer__inner site-footer__inner--rich">
        <div className="site-footer__brand-col">
          <Link href="/" className="brand footer-brand" aria-label="Go to MinRosh homepage">
            <span className="brand__mark" aria-hidden="true">
              <Image src="/images/minrosh-logo.svg" alt="" width={60} height={60} />
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
            <a
              href={`https://wa.me/${siteData.brand.whatsapp}?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20with%20visa%20options.`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: Chat with MinRosh
            </a>
            <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
              Alternate phone: {siteData.brand.phoneSecondary}
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__notice-wrap">
        <div className="site-footer__notice">
          General information only. Personal circumstances should be reviewed in consultation.
        </div>
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
