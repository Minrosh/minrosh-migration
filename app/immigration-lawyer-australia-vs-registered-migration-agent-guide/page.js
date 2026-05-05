import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.immigrationLawyerVsAgentGuide;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: guideData.keywords,
});

export default function ImmigrationLawyerVsAgentGuidePage() {
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
        eyebrow="Advisor Selection Guide"
        title={guideData.headline}
        intro={guideData.intro}
        heroImage={{
          src: "/images/hero-brisbane-river-cbd-hd.jpg",
          alt: "Brisbane CBD skyline and River at dusk for advisor selection guidance",
        }}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: guideData.path, label: "Lawyer vs Agent Guide" },
        ]}
        officialResources={guideData.officialResources ?? []}
        currentPath={guideData.path}
        sections={guideData.sections}
        faq={guideData.faq}
        related={[
          guideData.relatedService,
          { href: "/contact", title: "Contact MinRosh Migration" },
          { href: "/skilled-migration", title: "Skilled migration service" },
        ]}
      />
        </div>
      </div>
    </SiteShell>
  );
}
