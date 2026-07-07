import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "../../lib/whatsapp-prefill";
import { getHomeSiteData } from "../../lib/home-site-data";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { SiteSocialIcons } from "../../components/site-social-icons";
import { TrackedAnchor, TrackedLink } from "../../components/tracked-link";
import readinessSignals from "../../data/contact-readiness-signals.json";
import {
  PremiumContentGrid,
  PremiumCTAGroup,
  PremiumGlassCard,
  PremiumPageHero,
  PremiumPageShell,
  PremiumSectionHeader,
} from "../../components/premium";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";
import "../home.css";

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
      <PremiumPageShell id="contact-page" className="page-contact-shell contact-page--flush-top">
        <PremiumPageHero
          eyebrow="Contact MinRosh Migration"
          title="Clear next-step guidance from real humans"
          lead="Share your migration background, timing, and goal. We will review your enquiry and send practical next steps for skilled, student, partner, employer-sponsored, and complex pathways."
        >
          {trustSignals.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {trustSignals.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-brand-plum/10 bg-white/80 px-3 py-3 shadow-sm">
                  <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                  <p className="text-xs text-brand-plum/70">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </PremiumPageHero>

        <PremiumContentGrid className="mt-8 md:mt-10">
          <PremiumGlassCard className="p-5 md:p-7">
            <PremiumSectionHeader
              eyebrow="Connect now"
              title="WhatsApp, email, phone, and social"
              description="Choose the channel that fits your urgency. For structured enquiries, use the form — it helps us route you faster."
            />
            <PremiumCTAGroup>
              <TrackedAnchor
                href={waPrimary}
                target="_blank"
                rel="noreferrer"
                eventName="whatsapp_clicked"
                eventParams={{ cta_id: "contact_panel_whatsapp", cta_location: "contact_panel", destination: "whatsapp" }}
                aria-label="Chat on WhatsApp from contact panel"
                className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} w-full justify-center sm:w-auto`}
              >
                Chat on WhatsApp
              </TrackedAnchor>
              <TrackedLink href="/book-consultation" className="btn btn-ghost min-h-[48px] rounded-full px-5">
                Book consultation
              </TrackedLink>
            </PremiumCTAGroup>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-plum/10 bg-white/80 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-brand-plum">Email</p>
                <p className="mt-1 text-sm font-medium text-brand-plum/75">{supportEmailLabel || "Use the form"}</p>
              </div>
              {siteData.brand.phoneSecondary ? (
                <div className="rounded-2xl border border-brand-plum/10 bg-white/80 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-brand-plum">Phone</p>
                  <a
                    href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}
                    className="mt-1 block text-sm font-medium text-brand-plum/75 transition-colors hover:text-brand-rose"
                  >
                    {siteData.brand.phoneSecondary}
                  </a>
                </div>
              ) : null}
              <div className="rounded-2xl border border-brand-plum/10 bg-white/80 p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-wider text-brand-plum">Social</p>
                <div className="mt-2">
                  <SiteSocialIcons brand={siteData.brand} variant="contact" includeWhatsApp={false} />
                </div>
              </div>
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard
            id="contact-enquiry-form"
            className="contact-form-column premium-contact-shell p-4 md:p-6 lg:sticky lg:top-[calc(var(--site-header-chrome-height,88px)+16px)]"
          >
            <PremiumSectionHeader eyebrow="Enquiry form" title="Send your details" />
            <ContactLeadForm className="premium-contact-form mt-4" />
          </PremiumGlassCard>
        </PremiumContentGrid>
      </PremiumPageShell>
    </SiteShell>
  );
}
