import Link from "next/link";
import { TOPBAR_DESTINATION_LINKS } from "@/lib/destination-topbar-links";
import { listPublicSocialIcons } from "@/lib/social-public";
import { SiteSocialIcons } from "./site-social-icons";

const emailIcon = (
  <svg className="site-header__meta-icon" width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const phoneIcon = (
  <svg className="site-header__meta-icon" width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.86.37 1.7.72 2.49a1 1 0 01-.12 1.06l-1.38 2.27a16 16 0 006.06 6.06l2.27-1.38a1 1 0 011.06-.12c.8.35 1.64.6 2.5.72A2 2 0 0122 16.92z"
    />
  </svg>
);

/**
 * Destinations + email + phone + social. Rendered in the site footer (all viewports); the sticky header
 * uses {@link SiteHeaderMobileUtilities} on small screens for quick access while scrolling.
 */
export function SiteHeaderMetaRow({ siteData }) {
  const email = String(siteData?.brand?.email || "").trim();
  const supportEmailLabel = email.replace("@", " [at] ");
  const phoneRaw = String(siteData?.brand?.phone || "").trim();
  const telHref = phoneRaw ? `tel:${phoneRaw.replace(/\s+/g, "")}` : "";
  const topbarBrand = { ...siteData.brand, whatsappSecondary: "" };

  return (
    <div className="site-header__meta-row" aria-label="Destinations and contact">
      <div className="site-header__meta-destinations">
        {TOPBAR_DESTINATION_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="site-header__meta-destination-link">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="site-header__meta-contact">
        {email ? (
          <Link href="/contact" className="site-header__meta-contact-link" aria-label="Open contact page for email support">
            {emailIcon}
            <span>{supportEmailLabel}</span>
          </Link>
        ) : null}
        {telHref ? (
          <a href={telHref} className="site-header__meta-contact-link">
            {phoneIcon}
            <span>{phoneRaw}</span>
          </a>
        ) : null}
      </div>
      {listPublicSocialIcons(topbarBrand).length ? (
        <div className="site-header__meta-social" aria-label="Social">
          <SiteSocialIcons brand={topbarBrand} variant="topbar" />
        </div>
      ) : null}
    </div>
  );
}
