import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "About MinRosh Migration | Brisbane Migration Guidance",
  description:
    "Learn more about MinRosh Migration, our Brisbane-based approach, and how we support skilled, student, partner, and education pathways with structured guidance.",
  path: "/about",
  keywords: [
    "about MinRosh Migration",
    "Brisbane migration guidance",
    "migration consultancy Brisbane",
  ],
});

const sections = [
  {
    title: "Who we are",
    body: siteData.about.body,
    bullets: siteData.about.points,
  },
  {
    title: "How MinRosh works",
    body:
      "MinRosh is designed around calm communication, practical sequencing, and clearer next steps. That means helping clients understand not only what pathway may fit, but what should happen first, what can wait, and where weak preparation may create risk.",
    bullets: [
      "Structured pathway reviews before major commitments",
      "Education and migration planning that work together",
      "Clear handoff from assessment to consultation to action",
    ],
  },
  {
    title: "The countries we track",
    body:
      "While Australia is the main conversion focus of the site, MinRosh also keeps destination coverage across New Zealand, Canada, and the United Kingdom. That broader positioning helps clients who are still comparing major migration systems before committing to one path.",
    bullets: [
      "Australia-focused migration and education support",
      "Comparative insight across NZ, Canada, and the UK",
      "Official updates tracking through the updates hub",
    ],
  },
  {
    title: "What clients can expect in the first engagement",
    body:
      "The first engagement focuses on clarity and sequence. We identify your strongest pathway signal, surface risk points early, and define what should happen now versus later so you avoid wasted effort.",
    bullets: [
      "Initial risk and readiness review",
      "Priority document checklist with practical order",
      "Recommended next appointment based on urgency",
    ],
  },
  {
    title: "How we keep communication practical",
    body:
      "MinRosh keeps communication plain-language and decision-focused. You receive guidance that helps you act, not long policy summaries that are difficult to apply.",
    bullets: [
      "Plain explanations with clear action steps",
      "Progress updates tied to your active pathway",
      "Consultation notes designed for follow-through",
    ],
  },
];

export default function AboutPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/about">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <ContentPage
        eyebrow="About MinRosh"
        title="Structured migration guidance designed to feel clearer from the first conversation"
        intro="MinRosh Migration supports clients in Brisbane and across Australia with practical migration and education guidance built around calm communication, good preparation, and sensible next-step planning."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
        sections={sections}
        related={[
          { href: "/assessment", title: "Free Assessment" },
          { href: "/updates", title: "Official Updates Hub" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
    </SiteShell>
  );
}
