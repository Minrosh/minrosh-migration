import siteData from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "../../lib/seo";

const guideData = seoPages.guidePages.studentVisaGuide;
const SECTION_FLOW = [
  "Basic student visa requirements",
  "Financial capacity and preparation",
  "Processing time and planning",
  "Tips for a cleaner application",
  "Using Visa Finder when you are choosing between study and skilled routes",
];

function reorderSectionsForClarity(sections = []) {
  const desiredOrder = new Map(SECTION_FLOW.map((title, index) => [title, index]));
  return [...sections].sort((a, b) => {
    const aIndex = desiredOrder.has(a.title) ? desiredOrder.get(a.title) : Number.MAX_SAFE_INTEGER;
    const bIndex = desiredOrder.has(b.title) ? desiredOrder.get(b.title) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

export const metadata = buildMetadata({
  title: guideData.metaTitle,
  description: guideData.metaDescription,
  path: guideData.path,
  keywords: ["Student visa Australia requirements", "Student visa Australia 500", "CoE visa requirements"],
});

export default function StudentVisaGuidePage() {
  const orderedSections = reorderSectionsForClarity(guideData.sections);

  return (
    <SiteShell siteData={siteData} currentPath={guideData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Student Visa Australia", path: "/student-visa-australia" },
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
        eyebrow="Student Visa Guide"
        title={guideData.headline}
        intro={guideData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/student-visa-australia", label: "Student Visa" },
          { href: guideData.path, label: "Guide" },
        ]}
        officialResources={guideData.officialResources ?? []}
        currentPath={guideData.path}
        summary="Students who need a clear requirements checklist before paying fees, booking medicals, or locking timelines."
        takeaways={[
          "Confirm your exact subclass and requirement page from official sources first.",
          "Prepare CoE, financial and supporting evidence together as one consistent application pack.",
          "Decide whether to continue self-guided or book a strategy session for complex or time-sensitive cases.",
        ]}
        sections={orderedSections}
        faq={guideData.faq}
        related={[
          guideData.relatedService,
          { href: "/contact", title: "Start your enquiry" },
          { href: "/skilled-migration-australia-points-guide", title: "Skilled migration points guide" },
        ]}
      />
    </SiteShell>
  );
}
