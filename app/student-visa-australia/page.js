import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";

const pageData = seoPages.servicePages.studentVisa;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function StudentVisaPage() {
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
        eyebrow="Student Visa Australia"
        title={pageData.headline}
        intro={pageData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: "Student Visa" },
        ]}
        officialResources={pageData.officialResources ?? []}
        currentPath={pageData.path}
        sections={pageData.sections}
        faq={pageData.faq}
        related={[
          ...pageData.relatedGuides,
          {
            href: "/immigration-lawyer-australia-vs-registered-migration-agent-guide",
            title: "Immigration lawyer vs registered migration agent guide",
          },
          { href: "/contact", title: "Speak with MinRosh Migration" },
        ]}
      />
    </SiteShell>
  );
}
