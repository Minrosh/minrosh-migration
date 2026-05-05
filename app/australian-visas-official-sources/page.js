import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { AustralianVisasHubLead } from "../../components/australian-visas-hub-lead";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.australianVisasOfficialSources;

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: guideData.keywords,
});

export default function AustralianVisasOfficialSourcesPage() {
  return (
    <SiteShell siteData={siteData} currentPath={guideData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
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
        eyebrow="Australian visas"
        title={guideData.headline}
        intro={guideData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: guideData.path, label: "Australian visas" },
        ]}
        heroImage={{
          src: "/images/visual-strip-destinations.jpg",
          alt: "Brisbane CBD skyline and River at dusk for Australian visa official sources guidance",
        }}
        belowHero={<AustralianVisasHubLead />}
        articleClassName="content-page--aus-visas-hub"
        officialResources={guideData.officialResources ?? []}
        sections={guideData.sections}
        faq={guideData.faq}
        currentPath={guideData.path}
        related={[
          guideData.relatedService,
          { href: "/skilled-migration", title: "Skilled migration Australia" },
          { href: "/partner-visa-australia", title: "Partner visa Australia" },
          { href: "/student-visa-australia", title: "Student visa Australia" },
          { href: "/employer-sponsored-visas", title: "Employer-sponsored visas" },
          { href: "/visitor-visas", title: "Visitor visas" },
          { href: "/assessment", title: "Free assessment" },
          { href: "/tools", title: "Client tools" },
        ]}
      />
    </SiteShell>
  );
}
