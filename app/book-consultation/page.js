import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import seoPages from "../../data/seo-pages.json";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { AgentRegistrationStrip } from "../../components/agent-registration-strip";
import { ContactCalmVisual } from "../../components/contact-calm-visual";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import readinessSignals from "../../data/book-consultation-readiness-signals.json";

const pageData = seoPages.servicePages.bookConsultation;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export default function BookConsultationPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const signalChips = Array.isArray(readinessSignals?.signalChips) ? readinessSignals.signalChips : [];
  const journeyRail = Array.isArray(readinessSignals?.journeyRail) ? readinessSignals.journeyRail : [];

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book Consultation", path: pageData.path },
        ])}
      />
      <section className="content-page">
        <BreadcrumbsNav
          currentPath={pageData.path}
          items={[
            { label: "Home", href: "/" },
            { label: "Book consultation", href: pageData.path },
          ]}
        />

        <section className="content-hero">
          <p className="section-label">Book Consultation</p>
          <h1>Reserve your strategy session with confidence</h1>
          <p>
            A premium consultation flow designed to reduce guesswork and lock your highest-impact
            next steps before you spend time on the wrong pathway.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold text-brand-plum/75">
              Endowed progress from the first step
            </span>
            <span className="rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold text-brand-plum/75">
              Human-led strategy call
            </span>
            <span className="rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold text-brand-plum/75">
              Official-source aligned
            </span>
          </div>
          {signalChips.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {signalChips.map((item) => (
                <div key={item.id} className="rounded-xl border border-brand-plum/15 bg-white px-3 py-2">
                  <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                  <p className="text-xs text-brand-plum/70">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
          {siteData.consultationHoursNote ? (
            <p className="content-hero__note">{siteData.consultationHoursNote}</p>
          ) : null}
        </section>

        {(pageData.officialResources ?? []).length ? (
          <section className="official-resources" aria-label="Official government sources">
            <h2>Official sources to verify visa options</h2>
            <ul>
              {(pageData.officialResources ?? []).map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="content-hero__note">
              MinRosh helps you interpret pathways against your facts. Subclass names, charges, and
              criteria are always confirmed on the Department of Home Affairs website before lodgement.
            </p>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="rounded-[2rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux md:p-7">
            <ContactCalmVisual />
            <div className="mt-5 rounded-2xl border border-brand-plum/10 bg-brand-cream/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/60">Consultation runway</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-plum/10">
                <span className="block h-full w-[45%] rounded-full bg-gradient-to-r from-brand-rose to-brand-gold" />
              </div>
              <p className="mt-2 text-sm text-brand-plum/75">
                You are already 45% complete once your core profile + timeframe are submitted.
              </p>
            </div>
            {journeyRail.length ? (
              <div className="mt-5 rounded-2xl border border-brand-plum/10 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/60">
                  Progressive disclosure roadmap
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
                <h2>Why book now</h2>
              </summary>
              <div className="content-accordion__body">
                <ul className="feature-list">
                  <li>Cut decision noise and focus only on viable pathways</li>
                  <li>Identify weak evidence areas before high-stakes applications</li>
                  <li>Get a practical sequence for tests, documents, and timing</li>
                </ul>
              </div>
            </details>

            <details className="content-section content-accordion bento-hover">
              <summary className="content-accordion__summary">
                <h2>What your session includes</h2>
              </summary>
              <div className="content-accordion__body">
                <ul className="feature-list">
                  <li>One-to-one strategic review of your migration profile</li>
                  <li>Confidence-rated pathway options with key trade-offs</li>
                  <li>Immediate next actions you can execute within 14 days</li>
                  <li>
                    Official reference mapping using{" "}
                    <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing">visa listing</a>{" "}
                    and{" "}
                    <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder">Visa Finder</a>
                  </li>
                </ul>
              </div>
            </details>
          </div>

          <div className="contact-form-column rounded-[2rem] border border-brand-plum/10 bg-white/90 p-4 shadow-lux md:p-6">
            <AgentRegistrationStrip brand={siteData.brand} />
            <ContactLeadForm mode="consultation" />
          </div>
        </section>
      </section>
    </SiteShell>
  );
}
