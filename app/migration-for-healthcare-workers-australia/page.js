import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { ContentPage } from "../../components/content-page";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, webPageSpeakableJsonLd } from "../../lib/seo";

const path = "/migration-for-healthcare-workers-australia";

export const metadata = buildMetadata({
  title: "Migration for Healthcare Workers",
  description:
    "General information about Australian visa categories often researched by nurses and allied health professionals, with links to official sources.",
  path,
  keywords: ["healthcare workers migration Australia", "nurse migration pathway", "allied health visa options"],
});

const sections = [
  {
    title: "Categories healthcare readers often research",
    body:
      "Public materials describe skilled, employer-sponsored, and regional visa categories that may list healthcare occupations, depending on current occupation lists and assessing-authority rules. MinRosh does not recommend a category or assess fit.",
  },
  {
    title: "Evidence themes often discussed publicly",
    body:
      "Official and assessing-authority pages commonly discuss qualifications, employment history, identity documents, and English results. Consistency across those themes is frequently mentioned; MinRosh summarises publicly available information only.",
    bullets: [
      "Occupation list and assessing-authority pages for the role you are reading about",
      "Registration and licensing themes where the official materials mention them",
      "Published timing notes for assessments and tests—verify on the source",
    ],
  },
];

const faq = [
  {
    question: "Can nurses apply through skilled migration pathways in Australia?",
    answer:
      "Official materials describe skilled and other work-related categories that may list nursing occupations, depending on current occupation lists and assessing-authority rules. MinRosh cannot conclude whether any individual is eligible. Read the Home Affairs visa listing and relevant assessing-authority pages, and seek a registered migration agent or Australian legal practitioner for personalised advice.",
  },
  {
    question: "Is employer sponsorship better for healthcare applicants?",
    answer:
      "MinRosh does not compare options for individual circumstances or recommend a visa. Employer-sponsored and points-tested categories are published separately on Home Affairs with different criteria. Verify current subclass pages, and consult an authorised professional if you need advice based on your situation.",
  },
];

export default function HealthcareWorkersPage() {
  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Migration for Healthcare Workers", path },
          ]),
          webPageSpeakableJsonLd({
            path,
            title: "Migration for Healthcare Workers | MinRosh Migration",
            description: "Voice-search friendly general information on healthcare-related Australian visa categories.",
          }),
        ]}
      />
      <ContentPage
        eyebrow="Healthcare migration"
        title="Migration for healthcare workers in Australia"
        intro="General orientation to publicly described Australian visa categories that healthcare professionals often research. Always verify criteria on official sources. MinRosh does not provide immigration assistance."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: path, label: "Healthcare Migration" },
        ]}
        currentPath={path}
        sections={sections}
        faq={faq}
        summary="Healthcare readers often research registration, evidence themes, and several published visa categories. MinRosh shares general information only."
        takeaways={[
          "Read occupation and assessing-authority pages first",
          "Treat evidence themes as public orientation, not a personal checklist",
          "Seek a registered migration agent for personalised advice",
        ]}
        related={[
          { href: "/skilled-migration", title: "Skilled Migration" },
          { href: "/employer-sponsored-visas", title: "Employer-Sponsored Visas" },
          { href: "/book-information-session", title: "Book information session" },
        ]}
      />
    </SiteShell>
  );
}
