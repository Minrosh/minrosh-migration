import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import { getComplianceConfig } from "../../lib/compliance";
import seoPages from "../../data/seo-pages.json";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { AgentRegistrationStrip } from "../../components/agent-registration-strip";
import { ContactCalmVisual } from "../../components/contact-calm-visual";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import readinessSignals from "../../data/book-information-session-readiness-signals.json";
import { TrackedLink } from "../../components/tracked-link";
import "../home.css";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";

const pageData = seoPages.servicePages.bookConsultation;

const SESSION_PATH = "/book-information-session";

export const metadata = buildMetadata({
  title: "Book Information Session | General Information & Education Enquiry",
  description:
    "Book a general information or education-course enquiry session. MinRosh does not provide immigration assistance, eligibility assessments, or visa application preparation.",
  path: SESSION_PATH,
  keywords: [
    "general information enquiry",
    "education course enquiry",
    "MinRosh information session",
  ],
});

export default function BookInformationSessionPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const compliance = getComplianceConfig(siteData);
  const journeyRail = Array.isArray(readinessSignals?.journeyRail) ? readinessSignals.journeyRail : [];

  return (
    <SiteShell siteData={siteData} currentPath={SESSION_PATH}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book information session", path: SESSION_PATH },
        ])}
      />
      <div className="conversion-premium-phase1 bg-[var(--brand-cream)] pb-16 pt-8 md:pt-12">
      <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
      <section className="content-page">
        <BreadcrumbsNav
          currentPath={SESSION_PATH}
          items={[
            { label: "Home", href: "/" },
            { label: "Book information session", href: SESSION_PATH },
          ]}
        />

        <section className="content-hero glass-card rounded-[2rem] bg-[rgba(255,255,255,0.75)] p-6 shadow-[0_12px_40px_rgba(74,24,48,0.06)] backdrop-blur-[20px] md:p-8 lg:p-10">
          <p className="section-label">General information / education discussion</p>
          <h1 className="[font-family:var(--font-display),Georgia,serif]">
            Book a General Information or Education Course session
          </h1>
          <p>
            Reserve a short discussion to clarify publicly available information themes or education-course options.
            This is not a visa strategy session, eligibility assessment, or immigration assistance.
          </p>
          <div className="content-aside-card__actions">
            <TrackedLink
              href="#information-session-form"
              eventName="cta_click"
              eventParams={{ cta_id: "book_primary_information_session", cta_location: "book_hero", destination: "#information-session-form" }}
              aria-label="Jump to information session booking form"
              className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} w-full min-h-[48px] sm:w-auto`}
            >
              Book session now
            </TrackedLink>
          </div>
          <p className="text-sm text-brand-plum/70">
            Prefer to explore official topics first?{" "}
            <TrackedLink
              href="/assessment"
              eventName="cta_click"
              eventParams={{ cta_id: "book_secondary_information_finder", cta_location: "book_hero", destination: "/assessment" }}
              aria-label="Go to Official Information Finder"
              className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
            >
              Open the Information Finder
            </TrackedLink>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold text-brand-plum/75">
              General information only
            </span>
            <span className="rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold text-brand-plum/75">
              Education-course discussion
            </span>
            <span className="rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold text-brand-plum/75">
              Official-source oriented
            </span>
          </div>
          {siteData.consultationHoursNote ? (
            <p className="content-hero__note">{siteData.consultationHoursNote}</p>
          ) : null}
          <p className="mt-3 max-w-2xl text-sm text-brand-plum/70">
            Discussion slots are 30 minutes, with at least 24 hours&apos; notice. Available windows are set in{" "}
            <strong>Brisbane (AEST)</strong>: Monday–Friday 7:00 pm–10:00 pm; Saturday–Sunday 9:00 am–10:00 pm (last
            start 9:30 pm Brisbane).
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="glass-card rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] p-5 shadow-lux backdrop-blur-[20px] md:p-7">
            <ContactCalmVisual />
            <div className="mt-5 rounded-2xl border border-brand-plum/10 bg-brand-cream/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/60">Before you book</p>
              <p className="mt-2 text-sm text-brand-plum/75">
                Bring questions about public information sources or education-course options. Do not send passports,
                visa files, or other sensitive migration documents through this form.
              </p>
            </div>
            {journeyRail.length ? (
              <div className="mt-5 rounded-2xl border border-brand-plum/10 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/60">
                  What happens next
                </p>
                <ul className="mt-3 space-y-2 text-sm text-brand-plum/80">
                  {journeyRail.map((step, index) => (
                    <li key={step.id} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-plum text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span>
                        <strong>{step.title}:</strong> {step.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <details className="content-section content-accordion bento-hover mt-5" open>
              <summary className="content-accordion__summary">
                <h2 className="[font-family:var(--font-display),Georgia,serif]">Why book a discussion</h2>
              </summary>
              <div className="content-accordion__body">
                <ul className="feature-list">
                  <li>Clarify which official sources apply to a topic you are researching</li>
                  <li>Discuss education-course options and admissions administration support</li>
                  <li>Separate general information from personalised immigration assistance</li>
                </ul>
              </div>
            </details>

            <details className="content-section content-accordion bento-hover">
              <summary className="content-accordion__summary">
                <h2 className="[font-family:var(--font-display),Georgia,serif]">What your discussion includes</h2>
              </summary>
              <div className="content-accordion__body">
                <ul className="feature-list">
                  <li>One-to-one orientation on publicly available information themes</li>
                  <li>Education-course enquiry support where relevant</li>
                  <li>Links and next-step themes grounded in official sources</li>
                  <li>
                    Reference mapping using{" "}
                    <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing">visa listing</a>{" "}
                    and{" "}
                    <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder">Visa Finder</a>
                  </li>
                </ul>
              </div>
            </details>

            <section className="content-section bento-hover mt-5" aria-label="What to do next">
              <h2 className="[font-family:var(--font-display),Georgia,serif]">What to do next</h2>
              <ul className="feature-list">
                <li>Submit your preferred time and enquiry type in the form</li>
                <li>Keep questions focused on general information or education courses</li>
                <li>For personalised visa advice, use the Register of Migration Agents referral below</li>
              </ul>
            </section>
          </div>

          <div id="information-session-form" className="contact-form-column glass-card rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] p-4 shadow-lux backdrop-blur-[20px] md:p-6">
            <AgentRegistrationStrip brand={siteData.brand} compliance={compliance} />
            <ContactLeadForm
              mode="consultation"
              acknowledgementText={compliance.formAcknowledgementText}
            />
          </div>
        </section>
      </section>
      </div>
      </div>
    </SiteShell>
  );
}
