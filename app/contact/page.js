import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "../../lib/whatsapp-prefill";
import { listPublicSocialIcons } from "../../lib/social-public";
import { getHomeSiteData } from "../../lib/home-site-data";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { QuickEnquiryForm } from "../../components/quick-enquiry-form";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import Link from "next/link";
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
  const supportEmailLabel = String(siteData?.brand?.email || "").trim();
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
      <div className="conversion-premium-phase1 contact-page--flush-top -mt-44 md:-mt-44 bg-[var(--brand-cream)] pb-12 pt-0 md:pt-0">
      <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
      <section className="content-page content-page--contact">
        <section className="content-hero contact-hero--blend contact-hero--home-adopt contact-hero--home-shell glass-card relative overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.72)] p-4 shadow-[var(--shadow-lux)] backdrop-blur-[18px] md:p-6 lg:p-8">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label contact-hero--home-adopt__badge">Contact MinRosh Migration</p>
              <h1 className="[font-family:var(--font-display),Georgia,serif]">{pageData.headline}</h1>
              <div className="contact-hero--home-adopt__accent-line" aria-hidden />
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
                <div className="contact-hero--home-adopt__trust mt-4 grid gap-3 sm:grid-cols-3 sm:auto-rows-fr sm:items-stretch">
                  {trustSignals.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card mb-0 h-full rounded-xl border border-brand-plum/15 bg-[rgba(255,255,255,0.75)] px-3 py-2 backdrop-blur-[20px]"
                    >
                      <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                      <p className="text-xs text-brand-plum/70">{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="content-hero__media contact-hero--blend__media" aria-hidden="true">
              <PublicFileImg
                src="/images/hero-brisbane-river-cbd-hd.jpg"
                alt="Brisbane CBD skyline and River at dusk"
                width={1600}
                height={900}
                className="h-full w-full object-cover object-bottom md:object-[center_bottom]"
                priority
                sizes="(max-width: 768px) 100vw, 1600px"
              />
            </div>
          </div>
        </section>
        <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="glass-card relative overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] shadow-lux backdrop-blur-[20px]">
            <div className="space-y-3 p-5 md:p-6">
              <ContactCalmVisual />
              <div className="contact-copy">
                <p className="section-label">Calm guidance, real humans</p>
                <h2 className="[font-family:var(--font-display),Georgia,serif]">
                  Start with a focused enquiry (fastest response path)
                </h2>
                <p>
                  Share your migration background, timing, and main visa goal. MinRosh Migration
                  supports Brisbane clients and remote clients across Australia with structured next-step
                  guidance. If you are still choosing a stream, browse the Department of Home Affairs visa
                  listing first, then tell us which subclass or goal you want to stress-test.
                </p>
                <div className="my-5 flex flex-wrap gap-3">
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
                <div className="rounded-2xl bg-brand-plum/[0.03] p-5 border border-brand-plum/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-plum/40 mb-4">Other ways to connect</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="min-w-[220px] flex-1 space-y-1 rounded-xl border border-brand-plum/10 bg-white/70 p-3">
                      <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-brand-plum/70">{supportEmailLabel || "Use the form"}</p>
                    </div>
                    {siteData.brand.phoneSecondary && (
                      <div className="min-w-[220px] flex-1 space-y-1 rounded-xl border border-brand-plum/10 bg-white/70 p-3">
                        <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Backup Phone</p>
                        <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`} className="text-sm font-medium text-brand-plum/70 hover:text-brand-rose transition-colors">
                          {siteData.brand.phoneSecondary}
                        </a>
                      </div>
                    )}
                    <div className="min-w-[220px] flex-1 space-y-1 rounded-xl border border-brand-plum/10 bg-white/70 p-3">
                      <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Social</p>
                      <SiteSocialIcons brand={siteData.brand} variant="contact" includeWhatsApp={false} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="contact-enquiry-form"
            className="contact-form-column premium-contact-shell glass-card rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] p-4 shadow-lux backdrop-blur-[20px] md:p-6"
          >
            <ContactLeadForm className="premium-contact-form" />
          </div>
        </section>

      </section>
      </div>
      </div>
    </SiteShell>
  );
}
