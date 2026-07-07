import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { SmartNavigator } from "../../components/smart-navigator";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { TrackedLink } from "../../components/tracked-link";
import { PushNotificationPrimer } from "../../components/push-notification-primer";
import {
  PremiumCTAGroup,
  PremiumGlassCard,
  PremiumPageHero,
  PremiumPageShell,
  PremiumSectionHeader,
} from "../../components/premium";
import { PREMIUM_BADGE_CLASS } from "../../lib/premium-page-classes";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";
import "../home.css";

export const metadata = buildMetadata({
  title: "Free Assessment | MinRosh Migration",
  description:
    "Start your MinRosh Migration free assessment to explore skilled, student, partner, and education pathways before booking a full consultation.",
  path: "/assessment",
  keywords: [
    "free migration assessment",
    "visa eligibility assessment Brisbane",
    "migration assessment Australia",
  ],
});

function AssessmentNavigatorFallback() {
  return (
    <div
      className="rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.55)] p-6 shadow-inner min-h-[280px] motion-safe:animate-pulse"
      aria-busy="true"
      aria-label="Loading Smart Navigator"
    />
  );
}

const assessmentSteps = [
  {
    number: 1,
    title: "Answer a few questions",
    description: "Goal, timing, and destination signals so we can route you responsibly.",
  },
  {
    number: 2,
    title: "See a suggested next step",
    description: "Indicative direction only — not a visa outcome or eligibility guarantee.",
  },
  {
    number: 3,
    title: "Choose how to continue",
    description: "Book a consultation, open pathway hubs, or refine your profile with official sources.",
  },
];

export default async function AssessmentPage() {
  const nonce = String((await headers()).get("x-csp-nonce") || "").trim();

  return (
    <SiteShell siteData={siteData} currentPath="/assessment">
      <StructuredData
        nonce={nonce}
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Assessment", path: "/assessment" },
        ])}
      />

      <PremiumPageShell className="page-assessment-shell">
        <BreadcrumbsNav
          currentPath="/assessment"
          items={[
            { label: "Home", href: "/" },
            { label: "Free assessment", href: "/assessment" },
          ]}
        />

        <PremiumPageHero
          eyebrow="Free assessment"
          title="Check eligibility in a few minutes — then choose your next step with clarity"
          lead="This guided flow points you toward the most relevant MinRosh pathway pages and tools. It does not replace reading official criteria or booking advice when your case is time-sensitive."
        >
          <div className="mt-5 flex flex-wrap gap-2" role="list">
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              100% free
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              A few minutes
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              No obligation
            </span>
          </div>
        </PremiumPageHero>

        <div className="page-assessment-prototype__split mt-8 md:mt-10">
          <PremiumGlassCard className="page-assessment-steps p-5 md:p-7">
            <PremiumSectionHeader eyebrow="What happens next" title="Three simple steps" />
            <ol className="mt-5 space-y-4">
              {assessmentSteps.map((step) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-brand-plum/10 bg-white/80 p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#881337] text-sm font-black text-white">
                    {step.number}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-brand-plum">{step.title}</p>
                    <p className="page-assessment-step__desc mt-1 text-sm text-brand-plum/70">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <PremiumCTAGroup>
              <TrackedLink
                href="/#quiz"
                eventName="cta_click"
                eventParams={{ cta_id: "assessment_points_wizard", cta_location: "assessment_split", destination: "/#quiz" }}
                className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} w-full justify-center sm:w-auto`}
              >
                Open points wizard
              </TrackedLink>
              <TrackedLink
                href="/book-consultation"
                eventName="cta_click"
                eventParams={{
                  cta_id: "assessment_split_consultation",
                  cta_location: "assessment_split",
                  destination: "/book-consultation",
                }}
                className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} w-full justify-center sm:w-auto`}
              >
                Book consultation
              </TrackedLink>
              <Link href="/contact" className="btn btn-ghost inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 sm:w-auto">
                Contact form
              </Link>
            </PremiumCTAGroup>
          </PremiumGlassCard>

          <div className="page-assessment-prototype__navigator-shell min-w-0">
            <Suspense fallback={<AssessmentNavigatorFallback />}>
              <SmartNavigator
                title="Step through the Smart Navigator"
                description="Select the answers that best match your situation today. You can restart anytime — bring notes from the Department of Home Affairs visa listing if you already know a subclass."
                primaryLabel="Continue"
                finalHref="/book-consultation"
              />
            </Suspense>
          </div>
        </div>

        <details
          className="content-section content-accordion bento-hover mt-8 rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] p-4 shadow-lux backdrop-blur-[20px] md:mt-10 md:p-6"
          open
        >
          <summary className="content-accordion__summary">
            <h2 className="[font-family:var(--font-display),Georgia,serif]">Before you start — quick preparation</h2>
          </summary>
          <div className="content-accordion__body">
            <p className="text-brand-plum/80">
              Stronger inputs produce clearer routing. If you can, have your occupation or study goal, destination
              preference, and rough timeline ready. When you are unsure which Australian stream applies, skim the
              official visa listing first, then return here.
            </p>
            <ul className="feature-list mt-4">
              <li>English test status and partner details (if relevant)</li>
              <li>Whether you need urgent human review versus self-paced research</li>
              <li>Links or screenshots from official sources you are already using</li>
            </ul>
          </div>
        </details>

        <PushNotificationPrimer variant="card" enquiryId="" />
      </PremiumPageShell>
    </SiteShell>
  );
}
