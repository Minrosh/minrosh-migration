import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { PublicFileImg } from "../../components/public-file-img";
import { AboutTeamMagnetic } from "../../components/about-team-magnetic";
import storySignals from "../../data/about-story-signals.json";

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

const timeline = [
  {
    year: "Step 01",
    title: "Initial profile orientation",
    body: "We map your situation against likely visa streams before you commit to expensive steps.",
  },
  {
    year: "Step 02",
    title: "Strategy design and risk screening",
    body: "Documentation, timing, and pathway viability are sequenced to avoid rework and uncertainty.",
  },
  {
    year: "Step 03",
    title: "Evidence quality and lodgement readiness",
    body: "We pressure-test consistency so your application narrative is clear before formal submission.",
  },
  {
    year: "Step 04",
    title: "Decision support and transition planning",
    body: "After key milestones, we keep guidance practical with next actions, not policy noise.",
  },
];

const team = [
  { name: "Case Strategy Lead", focus: "Pathway sequencing and refusal-risk reduction", image: "/images/brisbane-skyline.jpg" },
  { name: "Education Pathway Specialist", focus: "Study-to-career migration planning context", image: "/images/brisbane-skyline.jpg" },
  { name: "Client Success Desk", focus: "Progress communication and action follow-through", image: "/images/brisbane-skyline.jpg" },
];

export default function AboutPage() {
  const trustSignals = Array.isArray(storySignals?.trustSignals) ? storySignals.trustSignals : [];
  const timelineAmplifiers = Array.isArray(storySignals?.timelineAmplifiers) ? storySignals.timelineAmplifiers : [];

  return (
    <SiteShell siteData={siteData} currentPath="/about">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <article className="content-page">
        <BreadcrumbsNav
          currentPath="/about"
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">About MinRosh</p>
              <h1>A migration story built around clarity, care, and confident decisions</h1>
              <p>{siteData.about.body}</p>
              <ul className="feature-list">
                {siteData.about.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg src="/images/brisbane-skyline.jpg" alt="Brisbane skyline and riverfront" width={1600} height={900} />
            </div>
          </div>
        </section>

        {trustSignals.length ? (
          <section className="about-premium-stats-strip" aria-labelledby="about-stats-heading">
            <p className="section-label">Trust &amp; clarity</p>
            <h2 id="about-stats-heading" className="mt-2 text-xl font-bold tracking-tight text-brand-plum sm:text-2xl">
              Signals clients reference after early sessions
            </h2>
            <div className="about-premium-stats-strip__grid mt-6">
              {trustSignals.map((item) => (
                <div key={item.id} className="about-premium-stats-strip__item">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="content-section">
          <p className="section-label">Story timeline</p>
          <h2>How your journey unfolds with our team</h2>
          <div className="timeline mt-6 space-y-4">
            {timeline.map((item, idx) => (
              <article key={item.title} className="rounded-2xl border border-brand-plum/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-plum text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-rose">{item.year}</p>
                    <h3 className="text-lg font-bold text-brand-plum">{item.title}</h3>
                    <p className="mt-1 text-sm text-brand-plum/70">{item.body}</p>
                    {timelineAmplifiers[idx]?.proof ? (
                      <p className="mt-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3 py-2 text-xs font-medium text-brand-plum/80">
                        Social proof: {timelineAmplifiers[idx].proof}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section">
          <p className="section-label">Meet the team</p>
          <h2>The human faces behind your migration plan</h2>
          <AboutTeamMagnetic members={team} />
        </section>
      </article>
    </SiteShell>
  );
}
