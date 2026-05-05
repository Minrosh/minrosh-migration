import Link from "next/link";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { SkilledCostTimelineCalculator } from "../../components/tools/skilled-cost-timeline-calculator";
import { PublicFileImg } from "../../components/public-file-img";

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
    href: "/#quiz",
    title: "2026 points wizard",
    body: "Walk through a detailed skilled profile on the homepage for indicative points context (always verify on Home Affairs).",
    cta: "Open wizard",
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

      <div className="guide-premium-shell relative min-w-0 bg-[var(--brand-cream)] pb-16">
      <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
      <article className="content-page content-page--premium-guide">
        <BreadcrumbsNav
          currentPath={path}
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: path },
          ]}
        />

        <section className="content-hero glass-card premium-frosted-surface">
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
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/hero-brisbane-river-cbd-hd.jpg"
                alt="Brisbane CBD skyline and River at dusk for migration tools guidance"
                width={1600}
                height={900}
                className="h-full w-full object-cover object-[70%_center] md:object-[center_bottom]"
                priority
                sizes="(max-width: 768px) 100vw, 1600px"
              />
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
                <article className="tools-hub__card glass-card premium-frosted-surface bento-hover rounded-[var(--radius-xl)] border border-brand-plum/12 shadow-[var(--shadow-lux)]">
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

        <section className="content-section glass-card premium-frosted-surface bento-hover tools-hub__footer-cta">
          <h2>Prefer to speak first?</h2>
          <p>
            Use <Link href="/contact">contact</Link> for a written enquiry, or return to the{" "}
            <Link href="/">homepage</Link> for news and pathway overviews.
          </p>
        </section>
      </article>
      </div>
      </div>
    </SiteShell>
  );
}
