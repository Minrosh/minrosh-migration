import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";

const pageData = seoPages.servicePages.partnerVisa;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: ["Partner Visa Australia", "Partner visa agent", "Spouse visa Australia"],
});

export default function PartnerVisaPage() {
  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: pageData.title, path: pageData.path },
        ])}
      />
      <StructuredData data={faqJsonLd(pageData.faq)} />
      <ContentPage
        eyebrow="Partner Visa Australia"
        title={pageData.headline}
        intro={pageData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: "Partner Visa" },
        ]}
        sections={pageData.sections}
        faq={pageData.faq}
        related={[
          ...pageData.relatedGuides,
          { href: "/contact", title: "Book a consultation" },
        ]}
      />
    </SiteShell>
  );
}
