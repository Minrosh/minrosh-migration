import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { getLifestyleGuide } from "../../lib/lifestyle-guides";
import { getFirst14Days, getStudentJobBoardAu, getTransportGuide } from "../../lib/experience-data";
import { LifestyleExperienceBlock } from "../../components/lifestyle/lifestyle-experience-block";

import { HubClusterNavigator } from "../../components/seo/hub-cluster-navigator";

const pageData = seoPages.servicePages.studentVisa;

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
        mainLead={
          <>
            <HubClusterNavigator category="student" />
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
          { href: "/australian-visas-official-sources", title: "Official Sources" },
        ]}
      />
    </SiteShell>
  );
}
