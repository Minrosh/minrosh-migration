import siteData from "@/data/site.json";
import { ContentPage } from "@/components/content-page";
import { SiteShell } from "@/components/site-shell";
import { StructuredData } from "@/components/structured-data";
import { breadcrumbJsonLd, faqJsonLd, webPageSpeakableJsonLd } from "@/lib/seo";
import { mergedFaqItems } from "@/lib/intelligence/faq";
import seoPages from "@/data/seo-pages.json";

const pageData = seoPages.servicePages.faqHub;

const faqOfficialResources = pageData.officialResources;

const faqExtraSections = [
  {
    title: "Where to verify Australian visa rules",
    body:
      "FAQ answers here are general. For the visa you are considering, open the official subclass page from the Department of Home Affairs visa listing and read current criteria, charges, and forms. The Visa Finder can help when you are unsure which stream to open first.",
  },
];

const conversationalFaqItems = [
  {
    question: "How can I get an Australian partner visa if we are not married yet?",
    answer:
      "You may still qualify as de facto partners if you can show evidence of a genuine and continuing relationship. You usually need documents across financial, social, and household categories, plus timeline consistency.",
  },
  {
    question: "How long does a skilled visa usually take after I lodge?",
    answer:
      "Processing timelines vary by visa subclass, case complexity, and policy settings. MinRosh uses official Home Affairs updates as the baseline and then maps likely timing risks from your profile.",
  },
  {
    question: "Can I move from student visa to permanent residency in Australia?",
    answer:
      "Some students later move into skilled, employer-sponsored, or partner pathways. The best route depends on your occupation, location strategy, English profile, and evidence readiness.",
  },
];

/** Legacy /faq — unchanged ContentPage guide (Sprint 3f fallback). */
export function FaqLegacyPage() {
  const faqItems = [...mergedFaqItems(), ...conversationalFaqItems];
  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: pageData.title, path: pageData.path },
          ]),
          faqJsonLd(faqItems),
          webPageSpeakableJsonLd({
            path: pageData.path,
            title: pageData.metaTitle,
            description: pageData.speakableDescription,
          }),
        ]}
      />
      <ContentPage
        eyebrow="FAQ"
        title={pageData.headline}
        intro={pageData.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: pageData.path, label: pageData.title },
        ]}
        officialResources={faqOfficialResources}
        currentPath={pageData.path}
        sections={faqExtraSections}
        faq={faqItems}
        related={pageData.related}
      />
    </SiteShell>
  );
}
