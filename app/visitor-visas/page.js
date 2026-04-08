import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { getHomeSiteData } from "../../lib/home-site-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

const pageData = seoPages.servicePages.visitorVisas;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function VisitorVisasPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visitor Visas", path: pageData.path },
        ])}
      />
      <ContentPage
        eyebrow={pageData.eyebrow}
        title={pageData.headline}
        intro={pageData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: "Visitor Visas" },
        ]}
        sections={pageData.sections}
        related={pageData.related}
      />
    </SiteShell>
  );
}
