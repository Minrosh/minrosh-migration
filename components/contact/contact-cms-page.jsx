import siteDataStatic from "@/data/site.json";
import seoPages from "@/data/seo-pages.json";
import { getHomeSiteData } from "@/lib/home-site-data";
import { ContactLeadForm } from "@/components/contact-lead-form";
import { SiteShell } from "@/components/site-shell";
import { StructuredData } from "@/components/structured-data";
import { breadcrumbJsonLd } from "@/lib/seo";
import { PageRenderer } from "@/components/website-blocks/page-renderer";
import "@/app/home.css";

const pageData = seoPages.servicePages.contact;

/**
 * Published CMS content for /contact (Sprint 3b).
 * CMS blocks replace the marketing copy panel; ContactLeadForm is unchanged.
 * @param {{ content: { sections: unknown[], pageTitle?: string, isDraftPreview?: boolean } }} props
 */
export function ContactCmsPage({ content }) {
  const siteData = getHomeSiteData(siteDataStatic);
  const sections = Array.isArray(content?.sections) ? content.sections : [];

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: pageData.path },
        ])}
      />
      <div className="conversion-premium-phase1 page-contact-shell contact-page--flush-top bg-[var(--brand-cream)] pb-12 pt-2 md:pt-4">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
          <section className="content-page content-page--contact">
            {content?.isDraftPreview ? (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Draft preview — not visible to visitors without draft mode.
              </p>
            ) : null}
            <section className="contact-page__layout grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <div className="glass-card relative overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] shadow-lux backdrop-blur-[20px]">
                <div className="space-y-3 p-5 md:p-6">
                  <PageRenderer sections={sections} />
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
