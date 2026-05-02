import Link from "next/link";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { SkilledCostTimelineCalculator } from "../../components/tools/skilled-cost-timeline-calculator";

const path = "/tools";

export const metadata = buildMetadata({
  title: "Client tools",
  description:
    "MinRosh Migration client tools — eligibility assessment, points wizard entry, and guides. New interactive features ship here first.",
  path,
  keywords: ["migration tools Australia", "visa assessment", "MinRosh tools"],
});

const toolCards = [
  {
    href: "/tools/student-country-cost-planner",
    title: "Student country & cost planner",
    body: "Indicative tuition and living bands across Australia, Canada, the UK, and New Zealand for early budgeting — not eligibility advice.",
    cta: "Open planner",
  },
  {
    href: "/tools/pr-pathway-explorer",
    title: "PR pathway explorer",
    body: "Illustrative sequencing for how study or offshore skilled routes are usually discussed in Australia — orientation only.",
    cta: "Explore pathways",
  },
  {
    href: "/australian-visas-official-sources",
    title: "Visa list & official sources hub",
    body: "How to use the Department of Home Affairs visa listing and Visa Finder with MinRosh pathway pages — without mistaking summaries for law.",
    cta: "Read hub",
  },
  {
    href: "/assessment",
    title: "Free assessment",
    body: "Structured pathway intake before a consultation — clarify goals, timing, and the strongest next step.",
    cta: "Start assessment",
  },
  {
    href: "/assessment",
    title: "Pathway assessment",
    body: "Structured intake before a consultation — clarify goals and next steps (always verify skilled criteria on Home Affairs).",
    cta: "Start assessment",
  },
  {
    href: "/skilled-migration-australia-points-guide",
    title: "Points guide",
    body: "Long-form explanation of how points-tested skilled migration is usually framed and what to verify officially.",
    cta: "Read guide",
  },
  {
    href: "/australia-visa-document-checklist-guide",
    title: "Document checklist",
    body: "Practical checklist thinking for visa bundles — consistency and evidence quality before lodgement.",
    cta: "Open checklist",
  },
  {
    href: "/australia-visa-processing-times-guide",
    title: "Processing times",
    body: "How processing expectations are usually discussed, with links to verify current departmental guidance.",
    cta: "View guide",
  },
  {
    href: "/book-consultation",
    title: "Book consultation",
    body: "When your case needs sequencing, evidence planning, or a tight timeline, book a focused session with the team.",
    cta: "Book now",
  },
];

export default function ToolsPage() {
  const siteData = getHomeSiteData(siteDataStatic);

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path },
        ])}
      />

      <article className="content-page">
        <BreadcrumbsNav
          currentPath={path}
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: path },
          ]}
        />

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Client tools</p>
              <h1>Explore, assess, then book with confidence</h1>
              <p>
                Interactive tools and deep guides are grouped here so high-traffic marketing pages stay
                stable. Start with the official-sources hub or a free assessment; book a consultation when you
                need tailored sequencing for your circumstances.
              </p>
              <p className="content-hero__note">
                Nothing here replaces official Department of Home Affairs rules or personalised registered
                migration advice.
              </p>
            </div>
          </div>
        </section>

        <section className="tools-hub" aria-labelledby="tools-hub-heading">
          <div className="section-head">
            <div>
              <p className="section-label">Tools and guides</p>
              <h2 id="tools-hub-heading">Pick a starting point</h2>
            </div>
          </div>
          <ul className="tools-hub__grid">
            {toolCards.map((card) => (
              <li key={card.href}>
                <article className="tools-hub__card bento-hover">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <Link
                    href={card.href}
                    className="btn btn-primary tools-hub__card-cta min-h-[48px] touch-manipulation"
                  >
                    {card.cta}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <SkilledCostTimelineCalculator />

        <section className="content-section bento-hover tools-hub__footer-cta">
          <h2>Prefer to speak first?</h2>
          <p>
            Use <Link href="/contact">contact</Link> for a written enquiry, or return to the{" "}
            <Link href="/">homepage</Link> for news and pathway overviews.
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
