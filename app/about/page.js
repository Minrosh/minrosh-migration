import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { PublicFileImg } from "../../components/public-file-img";
import { AboutTeamMagnetic } from "../../components/about-team-magnetic";
import storySignals from "../../data/about-story-signals.json";
import {
  PremiumCTAGroup,
  PremiumGlassCard,
  PremiumPageHero,
  PremiumPageShell,
  PremiumSectionHeader,
} from "../../components/premium";
import { TrackedLink } from "../../components/tracked-link";
import { PREMIUM_BADGE_CLASS } from "../../lib/premium-page-classes";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";
import "../home.css";

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
  { name: "Case Strategy Lead", focus: "Pathway sequencing and refusal-risk reduction", image: "/images/hero-brisbane-river-cbd-hd.jpg" },
  { name: "Education Pathway Specialist", focus: "Study-to-career migration planning context", image: "/images/hero-brisbane-river-cbd-hd.jpg" },
  { name: "Client Success Desk", focus: "Progress communication and action follow-through", image: "/images/hero-brisbane-river-cbd-hd.jpg" },
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
      <PremiumPageShell>
        <BreadcrumbsNav
          currentPath="/about"
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />

        <PremiumPageHero
          eyebrow="About MinRosh"
          title="A migration story built around clarity, care, and confident decisions"
          lead={siteData.about.body}
        >
          <div className="mt-5 flex flex-wrap gap-2" role="list">
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Brisbane-based
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Australia, Canada, UK &amp; NZ pathways
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Plain-English guidance
            </span>
          </div>
          <ul className="feature-list mt-6">
            {siteData.about.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <PremiumCTAGroup>
            <TrackedLink href="/assessment" className={CONVERSION_PREMIUM_PRIMARY_CTA_CLASS}>
              Start free assessment
            </TrackedLink>
            <TrackedLink href="/book-consultation" className="btn btn-ghost min-h-[48px] rounded-full px-5">
              Book consultation
            </TrackedLink>
          </PremiumCTAGroup>
        </PremiumPageHero>

        <PremiumGlassCard className="mt-8 overflow-hidden p-0 md:mt-10">
          <div className="grid min-h-[220px] md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[200px] md:min-h-[280px]">
              <PublicFileImg
                src="/images/hero-brisbane-river-cbd-hd.jpg"
                alt="Brisbane CBD skyline and River at dusk"
                width={1600}
                height={900}
                className="absolute inset-0 h-full w-full object-cover object-bottom md:object-[center_bottom]"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8">
              <p className="section-label">Brisbane-based identity</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-plum [font-family:var(--font-display),Georgia,serif]">
                Local experts with a global outlook
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-plum/75 sm:text-base">
                We help clients plan skilled, student, partner, and employer-sponsored pathways with structured guidance
                grounded in official sources — not guesswork.
              </p>
            </div>
          </div>
        </PremiumGlassCard>

        {trustSignals.length ? (
          <PremiumGlassCard className="mt-8 p-6 md:mt-10 md:p-8" aria-labelledby="about-stats-heading">
            <PremiumSectionHeader
              eyebrow="Trust & clarity"
              title="Signals clients reference after early sessions"
            />
            <div className="about-premium-stats-strip__grid mt-6">
              {trustSignals.map((item) => (
                <div
                  key={item.id}
                  className="about-premium-stats-strip__item rounded-2xl border border-brand-plum/10 bg-white/80 p-4 shadow-sm"
                >
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </PremiumGlassCard>
        ) : null}

        <section className="mt-8 md:mt-10">
          <PremiumSectionHeader
            eyebrow="Story timeline"
            title="How your journey unfolds with our team"
          />
          <div className="mt-6 space-y-4">
            {timeline.map((item, idx) => (
              <PremiumGlassCard key={item.title} className="p-5">
                <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-plum text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-rose">{item.year}</p>
                    <h3 className="text-lg font-bold text-brand-plum [font-family:var(--font-display),Georgia,serif]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-brand-plum/70">{item.body}</p>
                    {timelineAmplifiers[idx]?.proof ? (
                      <p className="mt-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3 py-2 text-xs font-medium text-brand-plum/80">
                        Social proof: {timelineAmplifiers[idx].proof}
                      </p>
                    ) : null}
                  </div>
                </div>
              </PremiumGlassCard>
            ))}
          </div>
        </section>

        <section className="mt-8 md:mt-10">
          <PremiumSectionHeader
            eyebrow="Meet the team"
            title="The human faces behind your migration plan"
          />
          <div className="mt-6">
            <AboutTeamMagnetic members={team} />
          </div>
        </section>
      </PremiumPageShell>
    </SiteShell>
  );
}
