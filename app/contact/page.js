import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import Link from "next/link";

const pageData = seoPages.servicePages.contact;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: ["Migration Agent Brisbane Contact", "Visa consultation Brisbane", "Contact migration agent"],
});

export default function ContactPage() {
  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: pageData.path },
        ])}
      />
      <section className="content-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>
            <Link href="/">Home</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>
            <Link href={pageData.path}>Contact</Link>
          </span>
        </nav>
        <section className="content-hero">
          <p className="section-label">Contact MinRosh Migration</p>
          <h1>{pageData.headline}</h1>
          <p>{pageData.intro}</p>
        </section>
        <div className="contact-layout">
          <div className="contact-copy">
            <p className="section-label">Brisbane Migration Support</p>
            <h2>Start with a focused enquiry</h2>
            <p>
              Share your migration background, timing, and main visa goal. MinRosh Migration
              supports Brisbane clients and remote clients across Australia with structured next-step
              guidance.
            </p>
            <div className="contact-details">
              <div>
                <span>Email</span>
                <a href={`mailto:${siteData.brand.email}`}>{siteData.brand.email}</a>
              </div>
              <div>
                <span>Phone</span>
                <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
              </div>
              <div>
                <span>Alternate phone</span>
                <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
                  {siteData.brand.phoneSecondary}
                </a>
              </div>
              <div>
                <span>WhatsApp</span>
                <a
                  href={`https://wa.me/${siteData.brand.whatsapp}?text=Hi%20MinRosh%20Migration,%20I%20am%20interested%20in%20Australian%20visa%20options.`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {siteData.brand.phone}
                </a>
              </div>
              <div>
                <span>WhatsApp alternate</span>
                <a
                  href={`https://wa.me/${siteData.brand.whatsappSecondary}?text=Hi%20MinRosh%20Migration,%20I%20am%20interested%20in%20Australian%20visa%20options.`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {siteData.brand.phoneSecondary}
                </a>
              </div>
              <div>
                <span>Location</span>
                <a href="/">{siteData.brand.location}</a>
              </div>
            </div>
          </div>
          <ContactLeadForm />
        </div>
      </section>
    </SiteShell>
  );
}
