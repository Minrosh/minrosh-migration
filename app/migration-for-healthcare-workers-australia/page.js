import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { ContentPage } from "../../components/content-page";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, webPageSpeakableJsonLd } from "../../lib/seo";

const path = "/migration-for-healthcare-workers-australia";

export const metadata = buildMetadata({
  title: "Migration for Healthcare Workers",
  description:
    "Australia migration guidance for nurses, allied health professionals, and healthcare support roles with practical pathway checkpoints.",
  path,
  keywords: ["healthcare workers migration Australia", "nurse migration pathway", "allied health visa options"],
});

const sections = [
  {
    title: "Where healthcare profiles usually fit",
    body:
      "Healthcare professionals often evaluate skilled, employer-sponsored, and regional pathways. The best route depends on your occupation mapping, registration context, and timing priorities.",
  },
  {
    title: "Evidence to organize early",
    body:
      "Prepare qualifications, employment history, identity documents, and English results in a consistent bundle. Early evidence quality usually reduces rework later in the process.",
    bullets: [
      "Occupation and role history aligned with your target pathway",
      "Registration and licensing evidence where relevant",
      "Timeline planning for assessment, tests, and employer steps",
    ],
  },
];

const faq = [
  {
    question: "Can nurses apply through skilled migration pathways in Australia?",
    answer:
      "Many nursing profiles do evaluate skilled pathways, but eligibility depends on current occupation settings, assessment outcomes, and your personal profile details.",
  },
  {
    question: "Is employer sponsorship better for healthcare applicants?",
    answer:
      "For some applicants, employer sponsorship may be faster or more practical than points-tested routes. It depends on role demand, employer readiness, and your documentation timeline.",
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
            description: "Voice-search friendly guidance for healthcare migration pathways to Australia.",
          }),
        ]}
      />
      <ContentPage
        eyebrow="Healthcare migration"
        title="Migration for healthcare workers in Australia"
        intro="This page is built for healthcare applicants who want a practical pathway map before committing to one visa strategy."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: path, label: "Healthcare Migration" },
        ]}
        currentPath={path}
        sections={sections}
        faq={faq}
        summary="Healthcare applicants often need a sequencing-first strategy across registration, evidence quality, and pathway selection."
        takeaways={[
          "Map your occupation and target pathway first",
          "Build a clean evidence set before high-stakes submissions",
          "Use consultation for timing decisions and risk control",
        ]}
        related={[
          { href: "/skilled-migration", title: "Skilled Migration" },
          { href: "/employer-sponsored-visas", title: "Employer-Sponsored Visas" },
          { href: "/book-consultation", title: "Book Consultation" },
        ]}
      />
    </SiteShell>
  );
}
