import Link from "next/link";
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
    <SiteShell siteData={siteData} currentPath="">
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
              <h1>Start with a clearer assessment before you commit to the next step</h1>
              <p>
                This page is designed as a conversion-first assessment entry point. It helps clients
                understand whether they should start with the 2026 points wizard, the Smart
                Navigator, or a direct consultation based on how clear their pathway already is.
              </p>
              <div className="content-aside-card__actions">
                <Link href="/#quiz" className="btn btn-primary">
                  Open 2026 Points Wizard
                </Link>
                <Link href="/book-consultation" className="btn btn-ghost">
                  Book Consultation
                </Link>
              </div>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <img src="/images/brisbane-skyline.jpg" alt="Brisbane skyline and riverfront" />
            </div>
          </div>
        </section>

        <div className="content-page__grid">
          <div className="content-page__main">
            <section className="content-section bento-hover">
              <h2>What this assessment helps you do</h2>
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
            </section>

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
