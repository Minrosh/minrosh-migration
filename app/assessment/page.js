import Link from "next/link";
import { PublicFileImg } from "../../components/public-file-img";
import siteData from "../../data/site.json";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { SiteShell } from "../../components/site-shell";
import { SmartNavigator } from "../../components/smart-navigator";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

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
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>
            <Link href="/">Home</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>
            <Link href="/assessment">Assessment</Link>
          </span>
        </nav>

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Free Assessment</p>
              <h1>Find your best visa pathway in minutes</h1>
              <p>
                Answer a few focused questions and get a clearer direction based on your goals, timing,
                and pathway intent before you commit to the wrong process.
              </p>
              <p className="content-hero__note">
                Trusted by applicants across Australia and overseas • Private & secure • Brisbane-based support
              </p>
              <div className="content-aside-card__actions">
                <Link href="/#quiz" className="btn btn-primary">
                  Start Free Assessment
                </Link>
                <Link href="/book-consultation" className="btn btn-ghost">
                  Book Consultation
                </Link>
              </div>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/brisbane-skyline.jpg"
                alt="Brisbane skyline and riverfront"
                width={1600}
                height={900}
              />
            </div>
          </div>
        </section>

        <section className="official-resources" aria-label="Official government sources">
          <h2>Official sources before you assess</h2>
          <ul>
            <li>
              <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing" target="_blank" rel="noreferrer">
                Department of Home Affairs — visa listing
              </a>
            </li>
            <li>
              <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder" target="_blank" rel="noreferrer">
                Department of Home Affairs — Visa Finder
              </a>
            </li>
            <li>
              <Link href="/australian-visas-official-sources">MinRosh hub: how to use those tools with our pages</Link>
            </li>
          </ul>
          <p className="content-hero__note">
            The Smart Navigator and points wizard give indicative direction only. Always confirm criteria, charges,
            and forms on the Department of Home Affairs website for your subclass.
          </p>
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
          </div>

          <div className="content-page__aside">
            <ContactLeadForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
