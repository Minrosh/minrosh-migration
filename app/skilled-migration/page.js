import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { HubClusterNavigator } from "../../components/seo/hub-cluster-navigator";

const pageData = seoPages.servicePages.skilledMigration;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function SkilledMigrationPage() {
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
        eyebrow="Skilled Migration Australia"
        title={pageData.headline}
        intro={pageData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: "Skilled Migration" },
        ]}
        currentPath={pageData.path}
        officialResources={pageData.officialResources ?? []}
        sections={pageData.sections}
        faq={pageData.faq}
        mainLead={<HubClusterNavigator category="skilled" />}
        heroImage={{
          src: "/images/hero-sydney-real.jpg",
          alt: "Sydney Harbour — Australian skilled migration context",
        }}
        summary="Skilled migration allows qualified professionals to move to Australia based on their points, occupation, and state demand. Key steps include Skills Assessment, English testing, and an Expression of Interest (EOI)."
        related={[
          ...pageData.relatedGuides,
          {
            href: "/skilled-migration-australia-points-guide",
            title: "Points Test Guide",
          },
          {
            href: "/australia-visa-fees-and-costs-guide",
            title: "Visa Fees & Costs",
          },
          {
            href: "/australian-visas-official-sources",
            title: "Official Sources",
          },
        ]}
      />
    </SiteShell>
  );
}
