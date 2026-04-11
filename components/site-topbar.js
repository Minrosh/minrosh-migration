import Link from "next/link";
import { listPublicSocialIcons } from "../lib/social-public";
import { SiteSocialIcons } from "./site-social-icons";

const destinationLinks = [
  { label: "Australia", href: "/destinations/australia" },
  { label: "New Zealand", href: "/destinations/new-zealand" },
  { label: "Canada", href: "/destinations/canada" },
  { label: "United Kingdom", href: "/destinations/united-kingdom" },
];

export function SiteTopbar({ siteData }) {
  return (
    <div className="site-topbar">
      <div className="site-topbar__inner">
        <div className="site-topbar__group">
          {destinationLinks.map((item) => (
            <Link key={item.href} href={item.href} className="country-destination-link">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="site-topbar__group site-topbar__group--contact">
          <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
          <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
          <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
            {siteData.brand.phoneSecondary}
          </a>
        </div>
        {listPublicSocialIcons(siteData.brand).length ? (
          <div className="site-topbar__group site-topbar__group--social" aria-label="Social and messaging">
            <SiteSocialIcons brand={siteData.brand} variant="topbar" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
