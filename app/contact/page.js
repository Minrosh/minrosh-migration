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
import { TrackedAnchor, TrackedLink } from "../../components/tracked-link";
import readinessSignals from "../../data/contact-readiness-signals.json";
import "../home.css";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";

const pageData = seoPages.servicePages.contact;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function ContactPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const supportEmailLabel = String(siteData?.brand?.email || "").trim().replace("@", " [at] ");
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
      <div className="conversion-premium-phase1 bg-[var(--brand-cream)] pb-16 pt-1">
      <section className="content-page">
        <BreadcrumbsNav
          currentPath={pageData.path}
          items={[
            { label: "Home", href: "/" },
            { label: "Contact", href: pageData.path },
          ]}
        />
        <section className="content-hero glass-card rounded-[2rem] border-white/40 p-6 shadow-[0_12px_40px_rgba(74,24,48,0.06)] md:p-8 lg:p-10">
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
              <div className="content-aside-card__actions">
                <TrackedLink
                  href="#contact-enquiry-form"
                  eventName="cta_click"
                  eventParams={{ cta_id: "contact_primary_enquiry", cta_location: "contact_hero", destination: "#contact-enquiry-form" }}
                  aria-label="Jump to contact enquiry form"
                  className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} w-full min-h-[48px] sm:w-auto`}
                >
                  Send focused enquiry
                </TrackedLink>
              </div>
              <p className="content-hero__note">
                Recommended flow: run the quiz for orientation, review pathway/service pages, then submit a focused
                enquiry with your likely stream and timeframe.
              </p>
              <p className="text-sm text-brand-plum/70">
                Prefer chat first?{" "}
                <TrackedAnchor
                  href={waPrimary}
                  eventName="cta_click"
                  eventParams={{ cta_id: "contact_hero_whatsapp", cta_location: "contact_hero", destination: "whatsapp" }}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Message MinRosh on WhatsApp"
                  className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
                >
                  Message on WhatsApp
                </TrackedAnchor>
                .
              </p>
              {trustSignals.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {trustSignals.map((item) => (
                    <div key={item.id} className="glass-card rounded-xl border border-brand-plum/15 px-3 py-2">
                      <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                      <p className="text-xs text-brand-plum/70">{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/brisbane-skyline.v2.webp"
                alt="Brisbane skyline and riverfront"
                width={1600}
                height={900}
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="contact-office-premium-panel glass-card rounded-[2rem] p-5 md:p-6">
            <h2>Office &amp; hours</h2>
            <p>
              <strong className="text-brand-plum">Location:</strong> {siteData.brand.location}
            </p>
            <p>
              <strong className="text-brand-plum">Scheduling:</strong> {siteData.consultationHoursNote}
            </p>
            <p className="text-sm">
              <strong className="text-brand-plum">Phone:</strong>{" "}
              <TrackedAnchor
                href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}
                eventName="cta_click"
                eventParams={{ cta_id: "contact_office_panel_phone", cta_location: "contact_office", destination: "phone" }}
                className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
              >
                {siteData.brand.phone}
              </TrackedAnchor>
            </p>
          </div>

          <div className="glass-card relative overflow-hidden rounded-[2rem] border border-brand-plum/10 shadow-lux">
            <div className="h-56 lg:h-72">
              <PublicFileImg
                src="/images/brisbane-skyline.v2.webp"
                alt="Calm Brisbane skyline view"
                width={1600}
                height={900}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 46vw"
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
                <div className="my-8 flex flex-wrap gap-4">
                  <TrackedAnchor 
                    href={waPrimary} 
                    target="_blank" 
                    rel="noreferrer"
                    eventName="cta_click"
                    eventParams={{ cta_id: "contact_panel_whatsapp", cta_location: "contact_panel", destination: "whatsapp" }}
                    aria-label="Chat on WhatsApp from contact panel"
                    className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} flex min-h-[48px] flex-1 justify-center gap-3 py-6 text-lg`}
                  >
                    <span className="text-2xl">💬</span>
                    Chat on WhatsApp
                  </TrackedAnchor>
                </div>
                <p className="mt-2 text-sm text-brand-plum/70">
                  Prefer a direct call?{" "}
                  <TrackedAnchor
                    href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}
                    eventName="cta_click"
                    eventParams={{ cta_id: "contact_panel_phone", cta_location: "contact_panel", destination: "phone" }}
                    aria-label={`Call ${siteData.brand.phone}`}
                    className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
                  >
                    Call {siteData.brand.phone}
                  </TrackedAnchor>
                  .
                </p>

                <div className="rounded-2xl bg-brand-plum/[0.03] p-6 border border-brand-plum/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-plum/40 mb-4">Other ways to connect</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-brand-plum/70">{supportEmailLabel || "Use the form"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Location</p>
                      <p className="text-sm font-medium text-brand-plum/70">{siteData.brand.location}</p>
                    </div>
                    {siteData.brand.phoneSecondary && (
                      <div className="space-y-1">
                        <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Backup Phone</p>
                        <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`} className="text-sm font-medium text-brand-plum/70 hover:text-brand-rose transition-colors">
                          {siteData.brand.phoneSecondary}
                        </a>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Social</p>
                      <SiteSocialIcons brand={siteData.brand} variant="contact" includeWhatsApp={false} />
                    </div>
                  </div>
                </div>
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
          <div
            id="contact-enquiry-form"
            className="contact-form-column premium-contact-shell glass-card rounded-[2rem] border border-brand-plum/10 p-4 shadow-lux md:p-6"
          >
            <AgentRegistrationStrip brand={siteData.brand} />
            <ContactLeadForm className="premium-contact-form" />
          </div>
        </section>

        <section className="contact-map-embed" aria-labelledby="contact-map-heading">
          <h2 id="contact-map-heading" className="sr-only">
            Office map
          </h2>
          <iframe
            title="Brisbane area map — MinRosh Migration office context"
            className="contact-map-embed__frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.openstreetmap.org/export/embed.html?bbox=152.92%2C-27.52%2C153.20%2C-27.38&amp;layer=mapnik&amp;marker=-27.45%2C153.06"
          />
          <p className="mt-3 text-center text-xs text-brand-plum/55">
            Map data © OpenStreetMap contributors. Pin is indicative — confirm the exact address before visiting.
          </p>
        </section>
      </section>
      </div>
    </SiteShell>
  );
}
