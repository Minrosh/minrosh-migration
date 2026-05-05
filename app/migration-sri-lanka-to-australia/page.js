import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { MigrationPopularRoutes } from "../../components/migration-popular-routes";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { getHomeSiteData } from "../../lib/home-site-data";

const pageData = seoPages.servicePages.sriLankaMigration;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: [
    "Migration Sri Lanka to Australia",
    "Australian PR from Sri Lanka",
    "Skilled migration Sri Lanka",
    "MARA agent Sri Lanka",
  ],
});

export default function SriLankaMigrationPage() {
  const siteData = getHomeSiteData(siteDataStatic);

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
        eyebrow="Sri Lanka to Australia"
        title={pageData.headline}
        intro={pageData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: pageData.title },
        ]}
        belowHero={<MigrationPopularRoutes />}
        officialResources={pageData.officialResources ?? []}
        currentPath={pageData.path}
        sections={pageData.sections}
        faq={pageData.faq}
        heroImage={{
          src: "/images/hero-brisbane-river-cbd-hd.jpg",
          alt: "Brisbane River and CBD skyline — migration from Sri Lanka context",
        }}
        related={[
          ...(pageData.relatedGuides || []),
          { href: "/skilled-migration", title: "Skilled Migration Australia" },
          { href: "/contact", title: "Contact MinRosh Migration" },
        ]}
      />
    </SiteShell>
  );
}
