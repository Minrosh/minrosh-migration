import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";
import { PageHeroStrip } from "../../components/ui/page-hero-strip";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "../../lib/conversion-premium-cta-class";

const guideData = seoPages.guidePages.documentChecklistGuide;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: ["Australia visa checklist", "Visa documents Australia", "Migration document preparation"],
});

export default function DocumentChecklistGuidePage() {
  const heroStrip = (
    <PageHeroStrip
      className="guide-page-hero-strip h-[320px] sm:h-[360px]"
      overlayClassName="guide-page-hero-strip__overlay"
      eyebrow="Document Checklist Guide"
      title={guideData.headline}
      subtitle={guideData.intro}
      bgImage="/images/hero-brisbane-river-cbd-hd.jpg"
      bgAlt="Brisbane CBD skyline and River at dusk for visa document checklist guidance"
    />
  );

  return (
    <SiteShell siteData={siteData} currentPath={guideData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/updates" },
          { name: guideData.title, path: guideData.path },
        ])}
      />
      <StructuredData data={faqJsonLd(guideData.faq)} />
      <StructuredData
        data={articleJsonLd({
          title: guideData.title,
          description: guideData.metaDescription,
          path: guideData.path,
          datePublished: guideData.published,
        })}
      />
      <div className="guide-premium-shell relative min-w-0 bg-[var(--brand-cream)]">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)] pb-16">
          <ContentPage
            articleClassName="content-page--premium-guide"
            heroSlot={heroStrip}
            enablePremiumGuideSurfaces
            primaryCtaClassName={CONVERSION_PREMIUM_PRIMARY_CTA_CLASS}
            eyebrow="Document Checklist Guide"
            title={guideData.headline}
            intro={guideData.intro}
            breadcrumbs={[
          { href: "/", label: "Home" },
          { href: guideData.path, label: "Document Checklist Guide" },
            ]}
            officialResources={guideData.officialResources ?? []}
            currentPath={guideData.path}
            sections={guideData.sections}
            faq={guideData.faq}
            related={[
          guideData.relatedService,
          { href: "/australia-visa-fees-and-costs-guide", title: "Visa fees and costs guide" },
          { href: "/book-consultation", title: "Book a consultation" },
            ]}
          />
        </div>
      </div>
    </SiteShell>
  );
}
