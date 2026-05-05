import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.countryComparisonGuide;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: [
    "Australia vs Canada migration",
    "Compare migration pathways",
    "Skilled migration comparison 2026",
  ],
});

export default function CountryComparisonGuidePage() {
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
        enablePremiumGuideSurfaces
        eyebrow="Country Comparison Guide"
        title={guideData.headline}
        intro={guideData.intro}
        heroImage={{
          src: "/images/hero-brisbane-river-cbd-hd.jpg",
          alt: "Brisbane CBD skyline and River at dusk for country comparison guidance",
        }}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: guideData.path, label: "Australia vs Canada Guide" },
        ]}
        officialResources={guideData.officialResources ?? []}
        currentPath={guideData.path}
        sections={guideData.sections}
        faq={guideData.faq}
        related={[
          guideData.relatedService,
          { href: "/destinations/australia", title: "Australia migration hub" },
          { href: "/destinations/canada", title: "Canada migration hub" },
        ]}
      />
        </div>
      </div>
    </SiteShell>
  );
}
