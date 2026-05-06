"use client";

import { useRef } from "react";
import Link from "next/link";
import { TOPBAR_DESTINATION_LINKS } from "@/lib/destination-topbar-links";
import { listPublicSocialIcons } from "../lib/social-public";
import { SiteSocialIcons } from "./site-social-icons";

export function SiteTopbar({ siteData }) {
  const destinationPickerRef = useRef(null);
  const topbarBrand = { ...siteData.brand, whatsappSecondary: "" };
  const supportEmailLabel = String(siteData?.brand?.email || "").trim();

  function closeDestinationPicker() {
    if (destinationPickerRef.current) destinationPickerRef.current.open = false;
  }

  return (
    <div className="site-topbar">
      <div className="site-topbar__inner">
        <div className="site-topbar__group site-topbar__destinations" aria-label="Destination hubs">
          {TOPBAR_DESTINATION_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="country-destination-link">
              {item.label}
            </Link>
          ))}
        </div>
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
        <div className="site-topbar__group site-topbar__group--contact">
          <Link href="/contact" aria-label="Open contact page for email enquiries">
            {supportEmailLabel || "Email support"}
          </Link>
          <a href="tel:0478100542">0478 100 542</a>
        </div>
        {listPublicSocialIcons(topbarBrand).length ? (
          <div className="site-topbar__group site-topbar__group--social" aria-label="Social and messaging">
            <SiteSocialIcons brand={topbarBrand} variant="topbar" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
