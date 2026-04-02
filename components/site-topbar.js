export function SiteTopbar({ siteData }) {
  return (
    <div className="site-topbar">
      <div className="site-topbar__inner">
        <div className="site-topbar__group">
          {["Australia", "New Zealand", "Canada", "United Kingdom"].map((country) => (
            <span key={country}>{country}</span>
          ))}
        </div>
        <div className="site-topbar__group site-topbar__group--contact">
          <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
          <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
          <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
            {siteData.brand.phoneSecondary}
          </a>
        </div>
      </div>
    </div>
  );
}
