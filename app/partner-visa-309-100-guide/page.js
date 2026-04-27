import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.partnerVisaOffshoreGuide;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: guideData.keywords,
});

export default function PartnerVisaOffshoreGuidePage() {
  return (
    <SiteShell siteData={siteData} currentPath={guideData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Partner Visa Australia", path: "/partner-visa-australia" },
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
        eyebrow="Partner Visa Offshore Guide"
        title={guideData.headline}
        intro={guideData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/partner-visa-australia", label: "Partner Visa" },
          { href: guideData.path, label: "309/100 Guide" },
        ]}
        officialResources={guideData.officialResources ?? []}
        currentPath={guideData.path}
        sections={guideData.sections}
        faq={guideData.faq}
        related={[
          guideData.relatedService,
          { href: "/partner-visa-820-801-guide", title: "820/801 onshore partner guide" },
          { href: "/book-consultation", title: "Book consultation" },
        ]}
      />
    </SiteShell>
  );
}
