import Link from "next/link";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { PublicFileImg } from "../../components/public-file-img";

const path = "/tools";

export const metadata = buildMetadata({
  title: "General Information Tools | MinRosh Migration",
  description:
    "Browse general information tools that organise publicly available sources and official links. These tools do not assess eligibility or recommend a visa.",
  path,
  keywords: [
    "migration information tools",
    "official visa sources Australia",
    "education cost planner",
    "MinRosh information tools",
  ],
});

const toolCards = [
  {
    href: "/assessment",
    title: "Official Information Finder",
    body: "Choose a broad topic to find general information and official source links.",
    cta: "Open Information Finder",
  },
  {
    href: "/tools/student-country-cost-planner",
    title: "Student country & cost planner",
    body: "Indicative tuition and living cost bands across selected study destinations for early budgeting using publicly discussed ranges.",
    cta: "Open cost planner",
  },
  {
    href: "/tools/pr-pathway-explorer",
    title: "Permanent Migration Information Explorer",
    body: "Browse publicly listed permanent and long-term visa category topics with links to official sources.",
    cta: "Browse permanent migration topics",
  },
  {
    href: "/australian-visas-official-sources",
    title: "Visa list & official sources hub",
    body: "How to use the Department of Home Affairs visa listing and Visa Finder alongside MinRosh general information pages.",
    cta: "Read official sources hub",
  },
  {
    href: "/skilled-migration-australia-points-guide",
    title: "Skilled migration points guide",
    body: "General explanation of how points-tested skilled migration is usually described, with links to verify current rules officially.",
    cta: "Read guide",
  },
  {
    href: "/australia-visa-document-checklist-guide",
    title: "Document checklist guide",
    body: "General checklist thinking for common evidence themes — always confirm requirements with official sources.",
    cta: "Open checklist guide",
  },
  {
    href: "/australia-visa-processing-times-guide",
    title: "Processing times guide",
    body: "How processing-time discussions are usually framed, with links to current departmental guidance.",
    cta: "View guide",
  },
  {
    href: "/contact",
    title: "General information enquiry",
    body: "Ask a general information question or request education-course support. MinRosh does not provide immigration assistance.",
    cta: "Contact us",
  },
  {
    href: "/education-consultation",
    title: "Education Course Enquiry",
    body: "Request general information about education providers and courses, and where available, admissions administrative support.",
    cta: "Education Course Enquiry",
  },
];

export default function ToolsPage() {
  const siteData = getHomeSiteData(siteDataStatic);

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "General Information Tools", path },
        ])}
      />

      <div className="guide-premium-shell relative min-w-0 bg-[var(--brand-cream)] pb-16">
        <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
          <article className="content-page content-page--premium-guide">
            <BreadcrumbsNav
              currentPath={path}
              items={[
                { label: "Home", href: "/" },
                { label: "General Information Tools", href: path },
              ]}
            />

            <section className="content-hero glass-card premium-frosted-surface">
              <div className="content-hero__grid">
                <div className="content-hero__copy">
                  <p className="section-label">General information</p>
                  <h1>General Information Tools</h1>
                  <p>
                    These tools organise publicly available information and official links. They do not assess
                    eligibility, recommend a visa or provide immigration assistance.
                  </p>
                  <p className="content-hero__note">
                    For advice based on your circumstances, help selecting a visa, or assistance with an application,
                    contact a registered migration agent or Australian legal practitioner.
                  </p>
                </div>
                <div className="content-hero__media" aria-hidden="true">
                  <PublicFileImg
                    src="/images/hero-brisbane-river-cbd-hd.jpg"
                    alt="Brisbane CBD skyline and River at dusk — MinRosh general information tools"
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
                  <p className="section-label">Browse by topic</p>
                  <h2 id="tools-hub-heading">Choose an information starting point</h2>
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

            <section className="content-section glass-card premium-frosted-surface bento-hover tools-hub__footer-cta">
              <h2>Need a written reply?</h2>
              <p>
                Use <Link href="/contact">contact</Link> for a general information or education-course enquiry, or
                return to the <Link href="/">homepage</Link>.
              </p>
            </section>
          </article>
        </div>
      </div>
    </SiteShell>
  );
}
