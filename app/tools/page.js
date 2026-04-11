import Link from "next/link";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

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

      <article className="content-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>
            <Link href="/">Home</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>
            <Link href={path}>Tools</Link>
          </span>
        </nav>

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Client tools</p>
              <h1>Explore, assess, then book with confidence</h1>
              <p>
                Interactive tools and deep guides are grouped here so high-traffic marketing pages stay
                stable. Start with education and assessments; book a consultation when you need tailored
                sequencing for your circumstances.
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
                  <Link href={card.href} className="btn btn-primary tools-hub__card-cta">
                    {card.cta}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </section>

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
