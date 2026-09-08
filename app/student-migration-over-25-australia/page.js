import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { ContentPage } from "../../components/content-page";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, webPageSpeakableJsonLd } from "../../lib/seo";

const path = "/student-migration-over-25-australia";

export const metadata = buildMetadata({
  title: "Student Migration for Applicants Over 25",
  description:
    "General information about Australian student visa topics often researched by applicants over 25, with links to official Genuine Student and related sources.",
  path,
  keywords: ["student visa over 25 Australia", "genuine student guidance", "study to migration pathway"],
});

const sections = [
  {
    title: "Themes often discussed for older applicants",
    body:
      "Public materials discuss Genuine Student factors, course purpose, and consistency between background and study plans. MinRosh summarises those themes; we do not assess whether any individual meets the criteria.",
  },
  {
    title: "Genuine Student topics on official pages",
    body:
      "Home Affairs pages commonly cover how study purpose, prior education or work, and financial capacity are described. Read the official student visa materials for current wording.",
    bullets: [
      "Course relevance themes as described on official guidance",
      "Financial evidence themes published for the subclass",
      "Avoid treating third-party templates as official requirements",
    ],
  },
];

const faq = [
  {
    question: "Can I apply for an Australian student visa if I am over 25?",
    answer:
      "Home Affairs publishes student visa criteria for the relevant subclass; age alone is not described as an automatic bar on the public materials MinRosh summarises. MinRosh cannot say whether any person should apply or will succeed. Confirm current Genuine Student and other requirements on the official student visa pages, and seek authorised professional advice for personalised conclusions.",
  },
  {
    question: "Does age automatically reduce my student visa chance?",
    answer:
      "MinRosh does not predict outcomes or chances. Official pages set out criteria such as Genuine Student factors, funds, and English where applicable. Age is one biographical fact among many that decision-makers may consider in context; only official sources and authorised professionals can advise on individual circumstances.",
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
            description: "Voice-search focused general information for student visa topics often researched by applicants over 25.",
          }),
        ]}
      />
      <ContentPage
        eyebrow="Student visa information"
        title="Student visa topics for applicants over 25"
        intro="General orientation to publicly described student visa themes that applicants over 25 often research. Always verify on official Home Affairs pages. MinRosh does not provide immigration assistance."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: path, label: "Student Migration Over 25" },
        ]}
        currentPath={path}
        sections={sections}
        faq={faq}
        summary="Official pages set out student visa criteria. Age is one biographical detail among many; MinRosh does not draw personal conclusions."
        takeaways={[
          "Read official Genuine Student and subclass pages",
          "Treat evidence themes as public orientation only",
          "Seek authorised professional advice for personalised conclusions",
        ]}
        related={[
          { href: "/student-visa-australia", title: "Student Visa Australia" },
          { href: "/student-visa-australia-requirements", title: "Student Visa Requirements" },
          { href: "/book-information-session", title: "Book information session" },
        ]}
      />
    </SiteShell>
  );
}
