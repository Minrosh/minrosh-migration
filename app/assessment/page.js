import Link from "next/link";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteData from "../../data/site.json";
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

export default function AssessmentPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/assessment">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Assessment", path: "/assessment" },
        ])}
      />

      <div className="content-page page-assessment-premium">
        <BreadcrumbsNav
          currentPath="/assessment"
          items={[
            { label: "Home", href: "/" },
            { label: "Free assessment", href: "/assessment" },
          ]}
        />

        <div className="page-assessment-prototype pb-16">
          <div className="page-assessment-prototype__split">
            <div className="min-w-0">
              <p className="section-label">Free assessment</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-plum sm:text-4xl md:text-[2.4rem]">
                Check eligibility in a few minutes — then choose your next step with clarity
              </h1>
              <p className="mt-4 text-base font-medium leading-relaxed text-brand-plum/75 sm:text-lg">
                This guided flow points you toward the most relevant MinRosh pathway pages and tools. It does not
                replace reading official criteria or booking advice when your case is time-sensitive.
              </p>
              <div className="page-assessment-prototype__badges" role="list">
                <span className="page-assessment-prototype__badge" role="listitem">
                  100% free
                </span>
                <span className="page-assessment-prototype__badge" role="listitem">
                  A few minutes
                </span>
                <span className="page-assessment-prototype__badge" role="listitem">
                  No obligation
                </span>
              </div>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-rose">What happens next</p>
                  <ol className="mt-4 space-y-4">
                    {assessmentSteps.map((step) => (
                      <li
                        key={step.title}
                        className="flex gap-4 rounded-2xl border border-brand-plum/10 bg-white/90 p-4 shadow-sm"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#881337] text-sm font-black text-white">
                          {step.number}
                        </span>
                        <div>
                          <p className="font-bold text-brand-plum">{step.title}</p>
                          <p className="mt-1 text-sm text-brand-plum/70">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap gap-3">
                  <TrackedLink
                    href="/#quiz"
                    eventName="cta_click"
                    eventParams={{ cta_id: "assessment_points_wizard", cta_location: "assessment_split", destination: "/#quiz" }}
                    className="btn btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-5"
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
                    className="btn btn-ghost inline-flex min-h-[48px] items-center justify-center rounded-full px-5"
                  >
                    Book consultation
                  </TrackedLink>
                  <Link href="/contact" className="btn btn-ghost inline-flex min-h-[48px] items-center justify-center rounded-full px-5">
                    Contact form
                  </Link>
                </div>
              </div>
            </div>

            <div className="page-assessment-prototype__navigator-shell min-w-0">
              <SmartNavigator
                title="Step through the Smart Navigator"
                description="Select the answers that best match your situation today. You can restart anytime — bring notes from the Department of Home Affairs visa listing if you already know a subclass."
                primaryLabel="Continue"
                finalHref="/book-consultation"
              />
            </div>
          </div>

          <details className="content-section content-accordion bento-hover mt-12 max-w-4xl" open>
            <summary className="content-accordion__summary">
              <h2>Before you start — quick preparation</h2>
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
        </div>
      </div>
    </SiteShell>
  );
}
