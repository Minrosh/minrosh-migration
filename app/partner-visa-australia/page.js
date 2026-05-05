import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { HubClusterNavigator } from "../../components/seo/hub-cluster-navigator";

const pageData = seoPages.servicePages.partnerVisa;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
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
        routeAccent="partner"
        eligibilityChecklist={[
          "Relationship type confirmed (married or de facto) with a consistent timeline across forms and evidence.",
          "Financial, social, and household categories mapped for evidence—not a single “photo album” narrative.",
          "Immigration history and prior visas reviewed for disclosure completeness.",
          "Health and character requirements understood as part of overall preparation.",
        ]}
        howWeHelp={[
          {
            title: "Evidence coaching",
            body: "We help you present relationship proof clearly across categories expected by decision-makers.",
            icon: "documents",
          },
          {
            title: "Onshore/offshore clarity",
            body: "Subclass choice is framed around your living situation and lodgement strategy—not guesses.",
            icon: "strategy",
          },
          {
            title: "Consistency reviews",
            body: "Forms, statements, and attachments are checked for alignment before submission milestones.",
            icon: "documents",
          },
        ]}
        eyebrow="Partner Visa Australia"
        title={pageData.headline}
        intro={pageData.intro}
        heroImage={{
          src: "/images/hero-brisbane-river-cbd-hd.jpg",
          alt: "Brisbane CBD skyline and River at dusk for partner visa evidence planning guidance",
        }}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: "Partner Visa" },
        ]}
        officialResources={pageData.officialResources ?? []}
        currentPath={pageData.path}
        sections={pageData.sections}
        faq={pageData.faq}
        mainLead={<HubClusterNavigator category="partner" currentPath={pageData.path} />}
        summary="Partner visas allow spouses or de facto partners of Australian citizens or PRs to live in Australia. The process focuses on proving a genuine and continuing relationship across financial, social, and household categories."
        takeaways={[
          "Gather relationship evidence (financial, social, household)",
          "Determine if onshore (820) or offshore (309) is your path",
          "Map your marriage or de facto history for consistency"
        ]}
        related={[
          ...pageData.relatedGuides,
          { href: "/partner-visa-820-801-guide", title: "Onshore 820/801 Guide" },
          { href: "/partner-visa-309-100-guide", title: "Offshore 309/100 Guide" },
          {
            href: "/australia-visa-processing-times-guide",
            title: "Processing Times",
          },
          { href: "/australian-visas-official-sources", title: "Official Sources" },
        ]}
      />
    </SiteShell>
  );
}
