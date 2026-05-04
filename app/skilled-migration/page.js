import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { HubClusterNavigator } from "../../components/seo/hub-cluster-navigator";
import { VisaRailSkilledAu } from "../../components/visa-rail-skilled-au";

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
        leftRail={<VisaRailSkilledAu currentPath={pageData.path} />}
        routeAccent="skilled"
        eligibilityChecklist={[
          "Occupation and skills assessment pathway identified against current priority lists — lists change.",
          "Points posture understood for subclasses you are considering (189/190/491 and related streams).",
          "English testing plan aligned to the level required for your pathway.",
          "State or territory nomination research captured where relevant to your timeline.",
        ]}
        howWeHelp={[
          {
            title: "Evidence structure",
            body: "Skills assessment and employment narratives are organised so reviewers see a consistent story.",
            icon: "documents",
          },
          {
            title: "Sequencing clarity",
            body: "We map dependencies (assessment → EOI/ROI → nomination → visa) so expensive steps land in the right order.",
            icon: "strategy",
          },
          {
            title: "Official-source habits",
            body: "Advice stays anchored to Home Affairs instruments and departmental guidance—not forum summaries alone.",
            icon: "strategy",
          },
        ]}
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
        mainLead={<HubClusterNavigator category="skilled" currentPath={pageData.path} />}
        heroImage={{
          src: "/images/hero-brisbane-river-cbd.jpg",
          alt: "Sydney Harbour — Australian skilled migration context",
        }}
        summary="Skilled migration allows qualified professionals to move to Australia based on their points, occupation, and state demand. Key steps include Skills Assessment, English testing, and an Expression of Interest (EOI)."
        takeaways={[
          "Verify your occupation on the latest priority list",
          "Calculate your points profile for 189/190 subclasses",
          "Map your skills assessment and English test sequence"
        ]}
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
