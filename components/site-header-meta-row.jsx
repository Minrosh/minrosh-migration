import Link from "next/link";
import { TOPBAR_DESTINATION_LINKS } from "@/lib/destination-topbar-links";
import { listPublicSocialIcons } from "@/lib/social-public";
import { SiteSocialIcons } from "./site-social-icons";

/**
 * Slim row inside the sticky global header: destination hubs + email + phone + social.
 * Hidden below 921px (mobile uses {@link SiteHeaderMobileUtilities}).
 */
export function SiteHeaderMetaRow({ siteData }) {
  const email = String(siteData?.brand?.email || "").trim();
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
          <a href={`mailto:${email}`} className="site-header__meta-contact-link">
            {email}
          </a>
        ) : null}
        {telHref ? (
          <a href={telHref} className="site-header__meta-contact-link">
            {phoneRaw}
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
