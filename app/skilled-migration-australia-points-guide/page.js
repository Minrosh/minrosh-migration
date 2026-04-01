import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.skilledMigrationGuide;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: ["Skilled migration Australia points guide", "Skilled migration points system"],
});

export default function SkilledMigrationGuidePage() {
  return (
    <SiteShell siteData={siteData} currentPath="">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Skilled Migration Australia", path: "/skilled-migration" },
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
      <ContentPage
        eyebrow="Skilled Migration Guide"
        title={guideData.headline}
        intro={guideData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/skilled-migration", label: "Skilled Migration" },
          { href: guideData.path, label: "Guide" },
        ]}
        sections={guideData.sections}
        faq={guideData.faq}
        related={[
          guideData.relatedService,
          { href: "/contact", title: "Book a skilled migration consultation" },
          { href: "/partner-visa-australia-guide", title: "Partner visa guide" },
        ]}
      />
    </SiteShell>
  );
}
