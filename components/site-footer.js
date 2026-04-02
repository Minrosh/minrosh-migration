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
  { href: "/updates", label: "Updates Hub" },
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
    function handleEnquiryCreated() {
      setStats((current) => ({ ...current, enquiryCount: current.enquiryCount + 1 }));
    }

    window.addEventListener("minrosh:enquiry-created", handleEnquiryCreated);
    return () => window.removeEventListener("minrosh:enquiry-created", handleEnquiryCreated);
  }, []);

  return (
    <footer className="site-footer site-footer--rich">
      <div className="site-footer__inner site-footer__inner--rich">
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
            Professional, empathetic, and authoritative support for skilled visa, student visa,
            partner visa, and education pathways.
          </p>
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
          Registered migration advice available. Verification details are provided during
          engagement. Website information is general in nature and does not replace advice tailored
          to your personal circumstances.
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
