import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import Link from "next/link";

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
  {
    title: "Trust, registration, and standards",
    body:
      "MinRosh maintains a compliance-first approach supported by professional standards, clear conduct expectations, and official-source verification before clients commit to major decisions.",
    bullets: [
      `OMARA register reference: ${siteData.brand.marn}`,
      siteData.brand.specialistAccreditationNote,
      "Official legislative and code-of-conduct links are published across legal pages",
    ],
  },
  {
    title: "How we use the Department of Home Affairs visa catalogue",
    body:
      "Australian visas are organised by subclass on immi.homeaffairs.gov.au. MinRosh explains strategy and evidence in plain language, but eligibility, fees, and forms are always confirmed on the official listing and each visa page. See also our hub on using the visa listing and Visa Finder alongside MinRosh guides.",
    bullets: [
      "Cross-check subclass criteria whenever policy dates or your circumstances change",
      "Use Visa Finder for early orientation, then read the specific subclass you intend to pursue",
      "Prefer primary sources over social media summaries when stakes are high",
    ],
  },
];

const aboutOfficialResources = [
  {
    label: "Department of Home Affairs — visa listing",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
  },
  {
    label: "Department of Home Affairs — Visa Finder",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder",
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
      <div className="marketing-visual-ref">
      <section className="about-glance-band" aria-label="MinRosh at a glance">
        <div className="about-glance-band__head">
          <p className="section-label">At a glance</p>
          <h2>Structured guidance built for clarity, confidence, and action</h2>
        </div>
        <div className="about-glance-band__grid">
          <article className="about-glance-band__card">
            <h3>Who we help</h3>
            <p>Skilled, student, partner, and complex-pathway applicants needing clearer sequencing.</p>
          </article>
          <article className="about-glance-band__card">
            <h3>How we work</h3>
            <p>Summary-first planning, practical next steps, and official-source verification before key moves.</p>
          </article>
          <article className="about-glance-band__card">
            <h3>What to do next</h3>
            <p>Start with a free assessment for direction, then book consultation when urgency or complexity is high.</p>
          </article>
        </div>
        <div className="about-glance-band__actions">
          <Link href="/assessment" className="btn btn-primary">
            Start Free Assessment
          </Link>
          <Link href="/book-consultation" className="btn btn-ghost">
            Book Consultation
          </Link>
        </div>
      </section>
      <ContentPage
        eyebrow="About MinRosh"
        title="Structured migration guidance designed to feel clearer from the first conversation"
        intro="MinRosh Migration supports clients in Brisbane and across Australia with practical migration and education guidance built around calm communication, good preparation, and sensible next-step planning. We routinely anchor discussions to the Department of Home Affairs visa listing so clients know where authoritative criteria live."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
        officialResources={aboutOfficialResources}
        currentPath="/about"
        sections={sections}
        related={[
          { href: "/australian-visas-official-sources", title: "Australian visas official sources hub" },
          { href: "/assessment", title: "Free Assessment" },
          { href: "/updates", title: "Official Updates Hub" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
      </div>
    </SiteShell>
  );
}
