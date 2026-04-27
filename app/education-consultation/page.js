import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";

const educationOfficialResources = [
  {
    label: "Department of Home Affairs — visa listing",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
  },
  {
    label: "Department of Home Affairs — Visa Finder (study)",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder/study",
  },
  {
    label: "Studying in Australia (Home Affairs)",
    href: "https://immi.homeaffairs.gov.au/visas/studying",
  },
];

const faq = [
  {
    question: "What is education consultation in a migration context?",
    answer:
      "Education consultation helps students and families think through course choices, destination fit, visa timing, and how study plans may connect to longer-term migration goals.",
  },
  {
    question: "Can education planning affect future migration options?",
    answer:
      "Yes. Course level, institution choice, post-study opportunities, and timing can all influence how realistic future migration pathways may be.",
  },
];

export const metadata = buildMetadata({
  title: "Education Consultation | Study Pathway Planning | MinRosh",
  description:
    "Explore education consultation with MinRosh Migration for course planning, student pathway strategy, and study decisions aligned with long-term migration goals.",
  path: "/education-consultation",
  keywords: [
    "Education consultation Australia",
    "study pathway planning",
    "student migration guidance",
  ],
});

export default function EducationConsultationPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/education-consultation">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Education Consultation", path: "/education-consultation" },
        ])}
      />
      <StructuredData data={faqJsonLd(faq)} />
      <ContentPage
        eyebrow="Education Consultation"
        title="Education consultation for students planning study with long-term direction"
        intro="MinRosh Migration supports students and families who need more than just a course list. We help connect study plans, student visa timing, financial preparation, and future migration thinking into one clearer pathway. Student visa criteria and charges are published on the Department of Home Affairs visa listing — always confirm the official subclass page before you commit to an intake."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/education-consultation", label: "Education Consultation" },
        ]}
        officialResources={educationOfficialResources}
        currentPath="/education-consultation"
        sections={[
          {
            title: "What education consultation usually covers",
            body: "Education consultation is about more than choosing a course. It usually includes understanding your study goals, exploring suitable institutions, identifying evidence requirements for a student visa, and considering how the study pathway may connect to future work or migration options.",
            bullets: [
              "Course and institution planning linked to practical outcomes",
              "Student visa preparation context, timing, and documentation guidance",
              "Long-term migration thinking alongside immediate study decisions",
            ],
          },
          {
            title: "Why structured study planning matters",
            body: "A rushed course decision can create problems later. Stronger planning helps students align budget, academic history, destination preference, and post-study expectations before they make commitments that are expensive to reverse.",
          },
          {
            title: "How MinRosh supports education pathways",
            body: "MinRosh helps students and families organise the early questions that often feel overwhelming: what to study, where to study, what documents matter first, and how the student pathway fits into a broader migration journey.",
            bullets: [
              "Calm, practical guidance instead of generic institution lists",
              "Support for students comparing destinations and longer-term goals",
              "A clearer pathway into student visa preparation and consultation",
            ],
          },
          {
            title: "Typical education consultation flow",
            body: "A structured consultation keeps planning grounded in real outcomes and timing. We map your target intake, evidence readiness, and next decisions so your study pathway is not disconnected from your migration goals.",
            bullets: [
              "Profile and destination fit review",
              "Course and institution shortlisting strategy",
              "Timeline planning for admissions and visa preparation",
            ],
          },
          {
            title: "Information to prepare before your session",
            body: "Bringing the right information helps the session move faster and produces clearer recommendations.",
            bullets: [
              "Academic history and latest qualification details",
              "English test status and target intake period",
              "Budget range and preferred destination options",
            ],
          },
          {
            title: "Using the official visa catalogue with course planning",
            body: "Course marketing materials are not the same as visa criteria. Use the visa listing to open the student visa subclass page relevant to you, note financial and English evidence themes, then compare institution offers against those realities. MinRosh helps you translate official requirements into a practical document and timing plan.",
          },
        ]}
        faq={faq}
        related={[
          { href: "/student-visa-australia", title: "Student Visa Australia guidance" },
          { href: "/updates", title: "Open the Updates Hub" },
          { href: "/contact", title: "Speak with MinRosh Migration" },
        ]}
      />
    </SiteShell>
  );
}
