import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { getComplianceConfig } from "../../lib/compliance";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { HubClusterNavigator } from "../../components/seo/hub-cluster-navigator";

const pageData = seoPages.servicePages.partnerVisa;
const compliance = getComplianceConfig(siteData);

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
          "Official pages typically cover relationship types (married or de facto) and how timelines are described.",
          "Published partner materials often discuss financial, social, and household evidence themes.",
          "Home Affairs guidance commonly addresses immigration history disclosure and prior visas.",
          "Health and character requirements are outlined on the relevant subclass pages.",
        ]}
        howWeHelp={[
          {
            title: "General information",
            body: "Plain-language summaries of publicly available partner visa category information.",
            icon: "documents",
          },
          {
            title: "Official sources",
            body: "Links to Home Affairs partner and family visa pages so you can verify current criteria yourself.",
            icon: "strategy",
          },
          {
            title: "Education referral",
            body: "Where relevant, education-course enquiry support—separate from visa applications. For personalised advice, seek an authorised professional.",
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
        complianceBanner={compliance.categoryPageBanner}
        complianceFooter={compliance.categoryPageFooter}
        sections={pageData.sections}
        faq={pageData.faq}
        mainLead={<HubClusterNavigator category="partner" currentPath={pageData.path} />}
        summary="Partner visas allow spouses or de facto partners of Australian citizens or PRs to live in Australia. The process focuses on proving a genuine and continuing relationship across financial, social, and household categories."
        takeaways={[
          "Official pages discuss relationship evidence themes (financial, social, household)",
          "Onshore (820) and offshore (309) streams are described separately on Home Affairs",
          "Published materials emphasise consistent timelines across forms and evidence"
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
