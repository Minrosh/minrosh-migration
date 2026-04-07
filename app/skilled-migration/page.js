import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";

const pageData = seoPages.servicePages.skilledMigration;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: ["Skilled Migration Australia", "Subclass 189", "Subclass 190", "Subclass 491"],
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
        officialResources={pageData.officialResources ?? []}
        sections={pageData.sections}
        faq={pageData.faq}
        heroImage={{
          src: "/images/hero-sydney-real.jpg",
          alt: "Sydney Harbour — Australian skilled migration context",
        }}
        related={[
          ...pageData.relatedGuides,
          { href: "/contact", title: "Contact MinRosh Migration" },
        ]}
      />
    </SiteShell>
  );
}
