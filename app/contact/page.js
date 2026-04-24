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
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { PublicFileImg } from "../../components/public-file-img";
import { SiteSocialIcons } from "../../components/site-social-icons";
import { ContactCalmVisual } from "../../components/contact-calm-visual";
import readinessSignals from "../../data/contact-readiness-signals.json";

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
  const trustSignals = Array.isArray(readinessSignals?.trustSignals) ? readinessSignals.trustSignals : [];
  const progressiveDisclosure = Array.isArray(readinessSignals?.progressiveDisclosure)
    ? readinessSignals.progressiveDisclosure
    : [];

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: pageData.path },
        ])}
      />
      <section className="content-page">
        <BreadcrumbsNav
          currentPath={pageData.path}
          items={[
            { label: "Home", href: "/" },
            { label: "Contact", href: pageData.path },
          ]}
        />
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
              <p className="content-hero__note">
                Recommended flow: run the quiz for orientation, review pathway/service pages, then submit a focused
                enquiry with your likely stream and timeframe.
              </p>
              {trustSignals.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {trustSignals.map((item) => (
                    <div key={item.id} className="rounded-xl border border-brand-plum/15 bg-white px-3 py-2">
                      <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                      <p className="text-xs text-brand-plum/70">{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
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
        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-white shadow-lux">
            <div className="h-56 lg:h-72">
              <PublicFileImg
                src="/images/brisbane-skyline.jpg"
                alt="Calm Brisbane skyline view"
                width={1600}
                height={900}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4 p-6">
              <ContactCalmVisual />
              <div className="contact-copy">
                <p className="section-label">Calm guidance, real humans</p>
                <h2>Start with a focused enquiry (fastest response path)</h2>
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
                {progressiveDisclosure.length ? (
                  <div className="mt-4 rounded-2xl border border-brand-plum/10 bg-brand-cream/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/60">
                      Progressive disclosure flow
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-brand-plum/80">
                      {progressiveDisclosure.map((item, index) => (
                        <li key={item.id} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-plum text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          <span>
                            <strong>{item.title}:</strong> {item.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="contact-form-column rounded-[2rem] border border-brand-plum/10 bg-white/90 p-4 shadow-lux md:p-6">
            <AgentRegistrationStrip brand={siteData.brand} />
            <QuickEnquiryForm />
            <ContactLeadForm />
          </div>
        </section>
      </section>
    </SiteShell>
  );
}
