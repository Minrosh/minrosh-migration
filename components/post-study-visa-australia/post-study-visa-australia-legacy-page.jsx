import siteData from "@/data/site.json";
import seoPages from "@/data/seo-pages.json";
import { ContentPage } from "@/components/content-page";
import { SiteShell } from "@/components/site-shell";
import { StructuredData } from "@/components/structured-data";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { HubClusterNavigator } from "@/components/seo/hub-cluster-navigator";
import { PageHeroStrip } from "@/components/ui/page-hero-strip";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";

const pageData = seoPages.servicePages.postStudyVisa;

/** Legacy /post-study-visa-australia content — kept as fallback when CMS is off, empty, or unreadable. */
export function PostStudyVisaAustraliaLegacyPage() {
  const heroStrip = (
    <PageHeroStrip
      className="guide-page-hero-strip h-[320px] sm:h-[360px]"
      overlayClassName="guide-page-hero-strip__overlay"
      eyebrow="Post-Study Visa Australia"
      title={pageData.headline}
      subtitle={pageData.intro}
      bgImage="/images/hero-brisbane-river-cbd-hd.jpg"
      bgAlt="Brisbane CBD skyline and River at dusk for post-study visa planning guidance"
    />
  );

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: pageData.title, path: pageData.path },
        ])}
      />
      <StructuredData data={faqJsonLd(pageData.faq)} />
      <div className="guide-premium-shell relative min-w-0 bg-[var(--brand-cream)]">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)] pb-16">
          <ContentPage
            routeAccent="student"
            articleClassName="content-page--premium-guide"
            heroSlot={heroStrip}
            enablePremiumGuideSurfaces
            primaryCtaClassName={CONVERSION_PREMIUM_PRIMARY_CTA_CLASS}
            eligibilityChecklist={[
              "Qualification level and study location checked against current subclass 485 stream rules.",
              "Application timing mapped to course completion, results release, and student visa expiry.",
              "Health, character, and identity documents planned before lodgement deadlines.",
              "Long-term skilled migration goals understood separately from post-study work rights.",
            ]}
            howWeHelp={[
              {
                title: "Stream clarity",
                body: "We explain which 485 stream may fit your qualification and what official criteria still need verification.",
                icon: "strategy",
              },
              {
                title: "Timing sequencing",
                body: "Completion letters, assessments, and visa expiry are aligned so you avoid status gaps where possible.",
                icon: "documents",
              },
              {
                title: "Pathway context",
                body: "Post-study work is positioned as a bridge—skilled migration options are mapped without PR guarantees.",
                icon: "strategy",
              },
            ]}
            eyebrow="Post-Study Visa Australia"
            title={pageData.headline}
            intro={pageData.intro}
            breadcrumbs={[
              { href: "/", label: "Home" },
              { href: pageData.path, label: "Post-Study Visa" },
            ]}
            currentPath={pageData.path}
            officialResources={pageData.officialResources ?? []}
            sections={pageData.sections}
            faq={pageData.faq}
            mainLead={<HubClusterNavigator category="student" currentPath={pageData.path} />}
            summary="Temporary Graduate (subclass 485) visas can allow eligible graduates to work in Australia after study. Eligibility depends on qualification, stream criteria, and current Home Affairs settings."
            takeaways={[
              "Confirm your course meets the relevant 485 stream before you commit",
              "Plan lodgement timing relative to completion and visa expiry",
              "Treat post-study work as temporary—not automatic permanent residence",
            ]}
            related={[
              ...pageData.relatedGuides,
              {
                href: "/australia-visa-processing-times-guide",
                title: "Processing times guide",
              },
              { href: "/australian-visas-official-sources", title: "Official Sources" },
            ]}
          />
        </div>
      </div>
    </SiteShell>
  );
}
