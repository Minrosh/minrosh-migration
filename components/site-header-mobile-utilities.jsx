"use client";

import { useRef } from "react";
import Link from "next/link";
import { TOPBAR_DESTINATION_LINKS } from "@/lib/destination-topbar-links";
import { listPublicSocialIcons } from "@/lib/social-public";
import { SiteSocialIcons } from "./site-social-icons";

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  );
}

/**
 * Compact destinations + contact + social for the sticky header on small viewports.
 * @param {{ siteData: { brand: { email?: string, name?: string, whatsapp?: string } } }} props
 */
export function SiteHeaderMobileUtilities({ siteData }) {
  const destinationPickerRef = useRef(null);
  const email = String(siteData?.brand?.email || "").trim();
  const topbarBrand = { ...siteData.brand, whatsappSecondary: "" };

  function closeDestinationPicker() {
    if (destinationPickerRef.current) destinationPickerRef.current.open = false;
  }

  return (
    <div className="site-header__utilities" aria-label="Contact and destinations">
      <details ref={destinationPickerRef} className="destination-picker">
        <summary className="destination-picker__summary">Destinations</summary>
        <div className="destination-picker__menu" role="listbox" aria-label="Select destination hub">
          {TOPBAR_DESTINATION_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="country-destination-link destination-picker__link"
              onClick={closeDestinationPicker}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </details>
      <div className="site-header__utility-actions">
        {email ? (
          <a
            className="site-header__icon-btn"
            href={`mailto:${email}`}
            aria-label={`Email ${email}`}
          >
            <IconMail />
          </a>
        ) : null}
        <a className="site-header__icon-btn" href="tel:0478100542" aria-label="Call 0478 100 542">
          <IconPhone />
        </a>
        {listPublicSocialIcons(topbarBrand).length ? (
          <SiteSocialIcons brand={topbarBrand} variant="topbar" className="site-header__utility-social" />
        ) : null}
      </div>
    </div>
  );
}
