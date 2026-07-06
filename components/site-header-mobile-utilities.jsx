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

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.882-9.885 9.882m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

/**
 * Compact destinations + contact + social for the sticky header on small viewports.
 * @param {{ brand: { name?: string, whatsapp?: string }; whatsappHref?: string }} props
 */
export function SiteHeaderMobileUtilities({ brand, whatsappHref = "" }) {
  const destinationPickerRef = useRef(null);
  const topbarBrand = { ...brand, whatsappSecondary: "" };
  const showWhatsApp = typeof whatsappHref === "string" && /wa\.me\/\d+/.test(whatsappHref);
  const phoneRaw = String(brand?.phone || "").trim();
  const telHref = phoneRaw ? `tel:${phoneRaw.replace(/\s+/g, "")}` : "";
  const phoneAria = phoneRaw ? `Call ${phoneRaw}` : "Call MinRosh";

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
        <Link className="site-header__icon-btn" href="/contact" aria-label="Open contact page for email enquiries">
          <IconMail />
        </Link>
        {telHref ? (
          <a className="site-header__icon-btn" href={telHref} aria-label={phoneAria}>
            <IconPhone />
          </a>
        ) : null}
        {showWhatsApp ? (
          <a
            className="site-header__icon-btn"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp with MinRosh"
          >
            <IconWhatsApp />
          </a>
        ) : null}
        {listPublicSocialIcons(topbarBrand).length ? (
          <SiteSocialIcons brand={topbarBrand} variant="topbar" className="site-header__utility-social" />
        ) : null}
      </div>
    </div>
  );
}
