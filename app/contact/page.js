import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "../../lib/whatsapp-prefill";
import { listPublicSocialIcons } from "../../lib/social-public";
import { getHomeSiteData } from "../../lib/home-site-data";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { QuickEnquiryForm } from "../../components/quick-enquiry-form";
import { AgentRegistrationStrip } from "../../components/agent-registration-strip";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import Link from "next/link";
import { PublicFileImg } from "../../components/public-file-img";
import { SiteSocialIcons } from "../../components/site-social-icons";

const pageData = seoPages.servicePages.contact;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function ContactPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const waPrimary = buildWhatsAppUrl(siteData.brand.whatsapp, WHATSAPP_LEAD_MESSAGE);
  const waSecondary = buildWhatsAppUrl(siteData.brand.whatsappSecondary, WHATSAPP_LEAD_MESSAGE);

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
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Contact MinRosh Migration</p>
              <h1>{pageData.headline}</h1>
              <p>{pageData.intro}</p>
              <ul className="feature-list">
                <li>Clear next-step guidance based on your current profile and timing</li>
                <li>Support for skilled, student, partner, and complex case pathways</li>
                <li>Practical preparation notes before formal consultation</li>
              </ul>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/brisbane-skyline.jpg"
                alt="Brisbane skyline and riverfront"
                width={1600}
                height={900}
                priority
              />
            </div>
          </div>
        </section>
        {(pageData.officialResources ?? []).length ? (
          <section className="official-resources" aria-label="Official government sources">
            <h2>Official sources to verify requirements</h2>
            <ul>
              {(pageData.officialResources ?? []).map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="content-hero__note">
              For a structured overview of how these tools fit with MinRosh service pages, read the{" "}
              <Link href="/australian-visas-official-sources">Australian visas official sources hub</Link>
              .
            </p>
          </section>
        ) : null}
        <div className="contact-layout">
          <div className="contact-copy">
            <p className="section-label">Brisbane Migration Support</p>
            <h2>Start with a focused enquiry</h2>
            <p>
              Share your migration background, timing, and main visa goal. MinRosh Migration
              supports Brisbane clients and remote clients across Australia with structured next-step
              guidance. If you are still choosing a stream, browse the Department of Home Affairs visa
              listing first, then tell us which subclass or goal you want to stress-test.
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
                <a href={waPrimary} target="_blank" rel="noreferrer">
                  {siteData.brand.phone}
                </a>
              </div>
              <div>
                <span>WhatsApp alternate</span>
                <a href={waSecondary} target="_blank" rel="noreferrer">
                  {siteData.brand.phoneSecondary}
                </a>
              </div>
              <div>
                <span>Location</span>
                <Link href="/">{siteData.brand.location}</Link>
              </div>
            </div>
            {listPublicSocialIcons(siteData.brand, { includeWhatsApp: false }).length ? (
              <div className="contact-social">
                <span className="contact-social__label">Social</span>
                <SiteSocialIcons brand={siteData.brand} variant="contact" includeWhatsApp={false} />
              </div>
            ) : null}
          </div>
          <div className="contact-form-column">
            <AgentRegistrationStrip brand={siteData.brand} />
            <QuickEnquiryForm />
            <ContactLeadForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
