import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { getComplianceConfig } from "../../lib/compliance";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { getLifestyleGuide } from "../../lib/lifestyle-guides";
import { getFirst14Days, getStudentJobBoardAu, getTransportGuide } from "../../lib/experience-data";
import { LifestyleExperienceBlock } from "../../components/lifestyle/lifestyle-experience-block";
import { PageHeroStrip } from "../../components/ui/page-hero-strip";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "../../lib/conversion-premium-cta-class";

import { HubClusterNavigator } from "../../components/seo/hub-cluster-navigator";

const pageData = seoPages.servicePages.studentVisa;
const compliance = getComplianceConfig(siteData);

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function StudentVisaPage() {
  const lifestyleGuide = getLifestyleGuide("student-australia");
  const first14 = getFirst14Days("student-australia");
  const transport = getTransportGuide("australia");
  const jobBoard = getStudentJobBoardAu();
  const heroStrip = (
    <PageHeroStrip
      className="guide-page-hero-strip"
      overlayClassName="guide-page-hero-strip__overlay"
      eyebrow="Student Visa Australia"
      title={pageData.headline}
      subtitle={pageData.intro}
      bgImage="/images/hero-brisbane-river-cbd-hd.jpg"
      bgAlt="Brisbane CBD skyline and River at dusk for student visa planning guidance"
    />
  );

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: pageData.title, path: pageData.path },
        ])}
      />
      <div className="guide-premium-shell relative min-w-0 bg-[var(--brand-cream)]">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)] pb-16">
          <ContentPage
            routeAccent="student"
            articleClassName="content-page--premium-guide"
            heroSlot={heroStrip}
            enablePremiumGuideSurfaces
            primaryCtaClassName={CONVERSION_PREMIUM_PRIMARY_CTA_CLASS}
            eligibilityChecklist={[
          "Genuine Student (GS) expectations understood for your course and history — departmental criteria change over time.",
          "Financial capacity for tuition, living costs, and travel planned with verifiable sources.",
          "English proficiency testing pathway mapped to your institution and visa subclass rules.",
          "Overseas Student Health Cover (OSHC) and passport validity aligned to intended travel dates.",
            ]}
            howWeHelp={[
          {
            title: "Plain-English orientation",
            body: "We summarise departmental language into general topics so you know what to verify on official pages—not outcome guarantees.",
            icon: "strategy",
          },
          {
            title: "Document themes",
            body: "Public materials often discuss consistency across enrolment, funds, and identity evidence. We explain those themes; we do not prepare applications.",
            icon: "documents",
          },
          {
            title: "Education-course enquiry",
            body: "Where relevant, we can help with education-course research. Course choice and Genuine Student factors must be confirmed on official sources and with authorised professionals when you need personalised advice.",
            icon: "strategy",
          },
            ]}
            eyebrow="Student Visa Australia"
            title={pageData.headline}
            intro={pageData.intro}
            heroImage={{
          src: "/images/hero-brisbane-river-cbd-hd.jpg",
          alt: "Brisbane CBD skyline and River at dusk for student visa planning guidance",
            }}
            breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: "Student Visa" },
            ]}
            officialResources={pageData.officialResources ?? []}
            currentPath={pageData.path}
            complianceBanner={compliance.categoryPageBanner}
            complianceFooter={compliance.categoryPageFooter}
            mainLead={
          <>
            <HubClusterNavigator category="student" currentPath={pageData.path} />
            <LifestyleExperienceBlock
              guide={lifestyleGuide}
              first14={first14}
              transport={transport}
              jobBoard={jobBoard}
            />
          </>
            }
            sections={pageData.sections}
            faq={pageData.faq}
            summary="Student visas (Subclass 500) allow international students to study full-time in Australia. Success depends on Genuine Student (GS) requirements, financial capacity, and English proficiency."
            takeaways={[
          "Select a course and provider that aligns with your history",
          "Verify your financial capacity for fees and living costs",
          "Plan your Genuine Student (GS) evidence set early"
            ]}
            related={[
          ...pageData.relatedGuides,
          {
            href: "/student-visa-australia-requirements",
            title: "Detailed Requirements",
          },
          {
            href: "/australia-visa-fees-and-costs-guide",
            title: "Cost of Living & Fees",
          },
          {
            href: "/australia-visa-processing-times-guide",
            title: "Processing times guide",
          },
          {
            href: "/tools/student-country-cost-planner",
            title: "Student country & cost planner",
          },
          { href: "/australian-visas-official-sources", title: "Official Sources" },
            ]}
          />
        </div>
      </div>
    </SiteShell>
  );
}
