import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.partnerVisaGuide;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: ["Partner visa Australia guide", "How to apply for partner visa Australia"],
});

export default function PartnerVisaGuidePage() {
  return (
    <SiteShell siteData={siteData} currentPath="">
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
        eyebrow="Partner Visa Guide"
        title={guideData.headline}
        intro={guideData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/partner-visa-australia", label: "Partner Visa" },
          { href: guideData.path, label: "Guide" },
        ]}
        sections={guideData.sections}
        faq={guideData.faq}
        related={[
          guideData.relatedService,
          { href: "/contact", title: "Book a consultation" },
          { href: "/student-visa-australia-requirements", title: "Student visa requirements guide" },
        ]}
      />
    </SiteShell>
  );
}
