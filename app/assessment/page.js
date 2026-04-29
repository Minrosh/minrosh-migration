import Link from "next/link";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { PublicFileImg } from "../../components/public-file-img";
import siteData from "../../data/site.json";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { SiteShell } from "../../components/site-shell";
import { SmartNavigator } from "../../components/smart-navigator";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { TrackedLink } from "../../components/tracked-link";

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

const assessmentSteps = [
  {
    number: 1,
    title: "Free assessment",
    description: "Tell us about your background, your goal, and the destination you are considering.",
  },
  {
    number: 2,
    title: "Initial view",
    description: "We identify the most relevant pathway signals and the first issues to prioritise.",
  },
  {
    number: 3,
    title: "Human conversation",
    description: "If needed, we turn the assessment into a focused consultation with practical next steps.",
  },
];

export default function AssessmentPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/assessment">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Assessment", path: "/assessment" },
        ])}
      />

      <section className="content-page">
        <BreadcrumbsNav
          currentPath="/assessment"
          items={[
            { label: "Home", href: "/" },
            { label: "Assessment", href: "/assessment" },
          ]}
        />

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Free Assessment</p>
              <h1>Start with a clearer assessment before you commit to the next step</h1>
              <p>
                This page is designed as a conversion-first assessment entry point. It helps clients
                understand whether they should start with the 2026 points wizard, the Smart
                Navigator, or a direct consultation based on how clear their pathway already is.
              </p>
              <div className="content-aside-card__actions">
                <TrackedLink
                  href="/#quiz"
                  eventName="cta_click"
                  eventParams={{ cta_id: "assessment_primary_quiz", cta_location: "assessment_hero", destination: "/#quiz" }}
                  aria-label="Open points wizard from assessment page"
                  className="btn btn-primary min-h-[48px] touch-manipulation"
                >
                  Open 2026 Points Wizard
                </TrackedLink>
              </div>
              <p className="mt-3 text-sm text-brand-plum/70">
                Need a human strategy session instead?{" "}
                <TrackedLink
                  href="/book-consultation"
                  eventName="cta_click"
                  eventParams={{ cta_id: "assessment_secondary_consultation", cta_location: "assessment_hero", destination: "/book-consultation" }}
                  aria-label="Open consultation booking page"
                  className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
                >
                  Book consultation
                </TrackedLink>
                .
              </p>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/brisbane-skyline.v2.webp"
                alt="Brisbane skyline and riverfront"
                width={1600}
                height={900}
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </section>

        <div className="content-page__grid">
          <div className="content-page__main">
            <details className="content-section content-accordion bento-hover" open>
              <summary className="content-accordion__summary">
                <h2>What this assessment helps you do</h2>
              </summary>
              <div className="content-accordion__body">
                <p>
                  Some visitors already know they need a partner visa, student visa, or skilled
                  migration review. Others need help deciding what to prioritise first. This
                  assessment page is for both groups. It gives a lower-friction way to start, while
                  still leading into the stronger MinRosh conversion tools already built into the
                  website.
                </p>
                <ul className="feature-list">
                  <li>Quickly identify whether your strongest next step is quiz, navigator, or consultation</li>
                  <li>Reduce drop-off for visitors who are not ready to fill a long form yet</li>
                  <li>Guide high-intent users into contact with clearer context</li>
                </ul>
              </div>
            </details>

            <details className="content-section content-accordion bento-hover">
              <summary className="content-accordion__summary">
                <h2>What to prepare before you start</h2>
              </summary>
              <div className="content-accordion__body">
                <p>
                  A little preparation gives you a stronger assessment outcome. Bring key profile
                  facts so your next-step recommendation is more accurate and useful.
                </p>
                <ul className="feature-list">
                  <li>Your occupation, qualification level, and recent work history</li>
                  <li>English test status, partner details, and preferred destination</li>
                  <li>Target timeline and whether you need urgent support</li>
                </ul>
              </div>
            </details>

            <details className="content-section content-accordion bento-hover">
              <summary className="content-accordion__summary">
                <h2>Subclass orientation alongside this page</h2>
              </summary>
              <div className="content-accordion__body">
                <p>
                  If you do not yet know which Australian visa family fits, spend a few minutes with the
                  Department of Home Affairs Visa Finder, then open the relevant subclass from the visa listing.
                  Bring those notes to the Smart Navigator or consultation so advice stays tied to the correct
                  published criteria.
                </p>
              </div>
            </details>

            <details className="content-section content-accordion bento-hover">
              <summary className="content-accordion__summary">
                <h2>After assessment: the decision pathways</h2>
              </summary>
              <div className="content-accordion__body">
                <p>
                  Once complete, most users move into one of three practical actions depending on
                  readiness and urgency.
                </p>
                <ul className="feature-list">
                  <li>Continue with points wizard for a more detailed profile signal</li>
                  <li>Book consultation when timeline is tight or case complexity is high</li>
                  <li>Use contact form to receive focused follow-up for your scenario</li>
                </ul>
              </div>
            </details>

            <section className="process-section process-section--assessment">
              <div className="section-head section-head--process">
                <div>
                  <p className="section-label">How It Works</p>
                  <h2>A simple assessment flow before deeper review</h2>
                </div>
                <p className="process-section__lead">
                  Built to feel low-pressure while still moving visitors toward a practical action.
                </p>
              </div>
              <div className="process-grid">
                {assessmentSteps.map((step) => (
                  <article key={step.title} className="process-card bento-hover">
                    <div className="process-card__top">
                      <span className="process-card__number">{step.number}</span>
                      <h3>{step.title}</h3>
                    </div>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <SmartNavigator
              title="Use the upgraded Smart Navigator before you book"
              description="This expanded assessment grows out of the earlier MinRosh AI assessment flow and now returns a clearer service recommendation, urgency signal, and preparation checklist."
              primaryLabel="Open recommended page"
              finalHref="/book-consultation"
            />

            <section className="content-section bento-hover mt-5" aria-label="What to do next">
              <h2>What to do next</h2>
              <ul className="feature-list">
                <li>Use the points wizard if you want an immediate structured self-check</li>
                <li>Open Smart Navigator for advisory pathway direction and preparation cues</li>
                <li>Book consultation when your case is time-sensitive or complex</li>
              </ul>
            </section>
          </div>

          <div className="content-page__aside">
            <ContactLeadForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
