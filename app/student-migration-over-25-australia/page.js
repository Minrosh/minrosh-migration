import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { ContentPage } from "../../components/content-page";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, webPageSpeakableJsonLd } from "../../lib/seo";

const path = "/student-migration-over-25-australia";

export const metadata = buildMetadata({
  title: "Student Migration for Applicants Over 25",
  description:
    "Australia student migration guidance for applicants over 25 with practical planning for Genuine Student requirements and post-study strategy.",
  path,
  keywords: ["student visa over 25 Australia", "genuine student guidance", "study to migration pathway"],
});

const sections = [
  {
    title: "Why applicants over 25 need clear positioning",
    body:
      "For many applicants over 25, clarity of study purpose and progression logic matters. Your profile should show why the course is coherent with your background and future plan.",
  },
  {
    title: "How to strengthen your Genuine Student narrative",
    body:
      "Your statement and evidence should align your prior education/work history, course selection, and intended outcomes. Consistency across documents is key.",
    bullets: [
      "Show course relevance to your background or intended career direction",
      "Prepare financial evidence early and keep it internally consistent",
      "Avoid generic statements that do not match your profile reality",
    ],
  },
];

const faq = [
  {
    question: "Can I apply for an Australian student visa if I am over 25?",
    answer:
      "Yes, many applicants over 25 apply successfully. What matters most is profile coherence, course rationale, and evidence consistency.",
  },
  {
    question: "Does age automatically reduce my student visa chance?",
    answer:
      "Age alone does not decide outcomes. The quality and consistency of your Genuine Student evidence and supporting documentation are usually the key factors.",
  },
];

export default function StudentOver25Page() {
  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Student Migration Over 25", path },
          ]),
          webPageSpeakableJsonLd({
            path,
            title: "Student Migration Over 25 | MinRosh Migration",
            description: "Voice-search focused guidance for student migration applicants over 25 in Australia.",
          }),
        ]}
      />
      <ContentPage
        eyebrow="Student strategy"
        title="Student migration planning for applicants over 25"
        intro="This niche guide helps applicants over 25 structure a student pathway that is coherent, evidence-led, and aligned to official requirements."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: path, label: "Student Migration Over 25" },
        ]}
        currentPath={path}
        sections={sections}
        faq={faq}
        summary="Applicants over 25 usually benefit from stronger course rationale, financial clarity, and a staged study-to-pathway plan."
        takeaways={[
          "Build a clear course rationale connected to your profile",
          "Keep all GS and financial evidence consistent",
          "Use a staged timeline for study and next-step migration options",
        ]}
        related={[
          { href: "/student-visa-australia", title: "Student Visa Australia" },
          { href: "/student-visa-australia-requirements", title: "Student Visa Requirements" },
          { href: "/book-consultation", title: "Book Consultation" },
        ]}
      />
    </SiteShell>
  );
}
