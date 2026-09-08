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
  title: "About MinRosh Migration | Information & Education Support",
  description:
    "MinRosh Migration makes complex, publicly available migration and education information easier to navigate. We are not registered migration agents and do not provide immigration assistance.",
  path: "/about",
  keywords: [
    "about MinRosh Migration",
    "migration information Brisbane",
    "education course support",
  ],
});

const timeline = [
  {
    year: "Step 01",
    title: "Choose an information topic",
    body: "Select the visa category or education topic you want to read about from public sources.",
  },
  {
    year: "Step 02",
    title: "Review a general summary",
    body: "Read a neutral overview compiled from publicly available information.",
  },
  {
    year: "Step 03",
    title: "Verify with the official source",
    body: "Follow official links and check current criteria, forms, fees and processing information yourself.",
  },
  {
    year: "Step 04",
    title: "Seek authorised advice if needed",
    body: "For advice based on your circumstances or help with an application, contact a registered migration agent or Australian legal practitioner.",
  },
];

const team = [
  { name: "Information desk", focus: "Organising public migration and education information", image: "/images/hero-brisbane-river-cbd-hd.jpg" },
  { name: "Education support", focus: "Course enquiry and admissions administration support", image: "/images/hero-brisbane-river-cbd-hd.jpg" },
  { name: "Enquirer information desk", focus: "Clear communication on general information questions", image: "/images/hero-brisbane-river-cbd-hd.jpg" },
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
          title="Making public migration and education information easier to navigate"
          lead={siteData.about.body}
        >
          <div className="mt-5 flex flex-wrap gap-2" role="list">
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Brisbane-based
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Not a registered migration agent
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Education course support
            </span>
          </div>
          <ul className="feature-list mt-6">
            {siteData.about.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <PremiumCTAGroup>
            <TrackedLink href="/assessment" className={CONVERSION_PREMIUM_PRIMARY_CTA_CLASS}>
              Explore general information
            </TrackedLink>
            <TrackedLink href="/education-consultation" className="btn btn-ghost min-h-[48px] rounded-full px-5">
              Education course enquiry
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
                Brisbane-based information and education support
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-plum/75 sm:text-base">
                We organise publicly available information about skilled, student, partner, and employer-sponsored visa
                categories and can assist with education-course enquiries — grounded in official sources, not personalised
                immigration assistance.
              </p>
            </div>
          </div>
        </PremiumGlassCard>

        {trustSignals.length ? (
          <PremiumGlassCard className="mt-8 p-6 md:mt-10 md:p-8" aria-labelledby="about-stats-heading">
            <PremiumSectionHeader
              eyebrow="Trust & clarity"
              title="How MinRosh frames public information"
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
