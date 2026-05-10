import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "../../lib/whatsapp-prefill";
import { getHomeSiteData } from "../../lib/home-site-data";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { SiteSocialIcons } from "../../components/site-social-icons";
import { TrackedAnchor } from "../../components/tracked-link";
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
  const trustSignals = Array.isArray(readinessSignals?.trustSignals) ? readinessSignals.trustSignals : [];

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: pageData.path },
        ])}
      />
      <div className="conversion-premium-phase1 contact-page--flush-top bg-[var(--brand-cream)] pb-12 pt-2 md:pt-4">
      <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
      <section className="content-page content-page--contact">
        <section className="contact-page__layout grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="glass-card relative overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] shadow-lux backdrop-blur-[20px]">
            <div className="space-y-3 p-5 md:p-6">
              <div className="contact-copy">
                <p className="section-label">Contact MinRosh Migration</p>
                <h1 className="[font-family:var(--font-display),Georgia,serif] text-3xl md:text-4xl">
                  Clear next-step guidance from real humans
                </h1>
                <p>
                  Share your migration background, timing, and goal. We will review your enquiry and send practical
                  next steps for skilled, student, partner, employer-sponsored, and complex pathways.
                </p>
                {trustSignals.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {trustSignals.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-xl border border-brand-plum/10 bg-white/70 px-3 py-2">
                        <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                        <p className="text-xs text-brand-plum/70">{item.label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="my-5 flex flex-wrap gap-3">
                  <TrackedAnchor 
                    href={waPrimary} 
                    target="_blank" 
                    rel="noreferrer"
                    eventName="cta_click"
                    eventParams={{ cta_id: "contact_panel_whatsapp", cta_location: "contact_panel", destination: "whatsapp" }}
                    aria-label="Chat on WhatsApp from contact panel"
                    className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} flex min-h-[48px] w-full min-w-0 justify-center gap-3 py-6 text-lg sm:w-auto sm:flex-1 sm:min-w-[12rem]`}
                  >
                    <span className="text-2xl">💬</span>
                    Chat on WhatsApp
                  </TrackedAnchor>
                </div>
                <div className="rounded-2xl bg-brand-plum/[0.03] p-5 border border-brand-plum/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-plum/40 mb-4">Other ways to connect</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="min-w-0 w-full min-[400px]:min-w-[200px] sm:flex-1 space-y-1 rounded-xl border border-brand-plum/10 bg-white/70 p-3">
                      <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-brand-plum/70">{supportEmailLabel || "Use the form"}</p>
                    </div>
                    {siteData.brand.phoneSecondary && (
                      <div className="min-w-0 w-full min-[400px]:min-w-[200px] sm:flex-1 space-y-1 rounded-xl border border-brand-plum/10 bg-white/70 p-3">
                        <p className="text-xs font-black text-brand-plum uppercase tracking-wider">Phone</p>
                        <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`} className="text-sm font-medium text-brand-plum/70 hover:text-brand-rose transition-colors">
                          {siteData.brand.phoneSecondary}
                        </a>
                      </div>
                    )}
                    <div className="min-w-0 w-full min-[400px]:min-w-[200px] sm:flex-1 space-y-1 rounded-xl border border-brand-plum/10 bg-white/70 p-3">
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
