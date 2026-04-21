"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useId, useMemo, useState } from "react";

const TAB_KEYS = ["general", "education", "corporate"];

const TAB_META = [
  { id: "general", label: "General Migration" },
  { id: "education", label: "Education Services" },
  { id: "corporate", label: "Corporate Solutions" },
];

/**
 * Consolidates “services at a glance”, pathway chips, and large pathway cards into three tabs
 * to shorten the home scroll. Panels stack in one CSS grid cell so row height follows the
 * tallest tab (avoids layout jump when switching).
 */
export function HomeOurServicesTabs({
  variant = "home",
  quickServiceCards = [],
  visualHighlights = [],
  generalFeaturedServices = [],
  officialExtraService = null,
  educationServices = [],
  corporateServices = [],
  allServicesForServicesTab = [],
}) {
  const [active, setActive] = useState("general");
  const uid = useId();
  const tabPrefix = uid.replace(/:/g, "");

  const focusTab = useCallback((id) => {
    setActive(id);
    requestAnimationFrame(() => {
      document.getElementById(`${tabPrefix}-tab-${id}`)?.focus();
    });
  }, [tabPrefix]);

  const onTabKeyDown = useCallback(
    (event) => {
      const i = TAB_KEYS.indexOf(active);
      if (i < 0) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = event.key === "ArrowRight" ? (i + 1) % TAB_KEYS.length : (i - 1 + TAB_KEYS.length) % TAB_KEYS.length;
        focusTab(TAB_KEYS[next]);
      }
      if (event.key === "Home") {
        event.preventDefault();
        focusTab(TAB_KEYS[0]);
      }
      if (event.key === "End") {
        event.preventDefault();
        focusTab(TAB_KEYS[TAB_KEYS.length - 1]);
      }
    },
    [active, focusTab]
  );

  const isHome = variant === "home";
  const servicesTabPartitions = useMemo(
    () => (!isHome ? partitionForServicesTab(allServicesForServicesTab) : null),
    [isHome, allServicesForServicesTab]
  );

  return (
    <section
      id={isHome ? "home-our-services" : undefined}
      className={`home-services-tabs ${isHome ? "home-services-tabs--home" : "home-services-tabs--services-tab"}`}
      aria-labelledby={`${tabPrefix}-heading`}
    >
      <div className="home-services-tabs__intro">
        <p className="section-label">{isHome ? "Our services" : "Services"}</p>
        <h2 id={`${tabPrefix}-heading`}>
          {isHome
            ? "Support and visa categories in one place"
            : "Support shaped around real migration decisions"}
        </h2>
        {isHome ? (
          <p className="home-services-tabs__intro-copy">
            Choose a tab to browse general migration, education, or employer-backed pathways. Full detail pages are unchanged.
          </p>
        ) : (
          <p className="home-services-tabs__intro-copy">
            Browse by category, then open the pathway that matches your situation.
          </p>
        )}
      </div>

      <div role="tablist" aria-label="Service categories" className="home-services-tabs__tablist" onKeyDown={onTabKeyDown}>
        {TAB_META.map((tab) => (
          <button
            key={tab.id}
            id={`${tabPrefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`${tabPrefix}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={`home-services-tabs__tab ${active === tab.id ? "is-active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="home-services-tabs__stack">
        <div
          id={`${tabPrefix}-panel-general`}
          role="tabpanel"
          aria-labelledby={`${tabPrefix}-tab-general`}
          aria-hidden={active !== "general"}
          className={`home-services-tabs__panel ${active === "general" ? "is-active" : ""}`}
        >
          {isHome ? (
            <GeneralMigrationHomeTab
              quickServiceCards={quickServiceCards}
              featured={generalFeaturedServices}
              visualHighlights={visualHighlights}
              officialExtra={officialExtraService}
            />
          ) : (
            <ServicesTabServiceGrid services={servicesTabPartitions.general} />
          )}
        </div>

        <div
          id={`${tabPrefix}-panel-education`}
          role="tabpanel"
          aria-labelledby={`${tabPrefix}-tab-education`}
          aria-hidden={active !== "education"}
          className={`home-services-tabs__panel ${active === "education" ? "is-active" : ""}`}
        >
          {isHome ? (
            <EducationHomeTab services={educationServices} visualHighlights={visualHighlights} />
          ) : (
            <ServicesTabServiceGrid services={servicesTabPartitions.education} />
          )}
        </div>

        <div
          id={`${tabPrefix}-panel-corporate`}
          role="tabpanel"
          aria-labelledby={`${tabPrefix}-tab-corporate`}
          aria-hidden={active !== "corporate"}
          className={`home-services-tabs__panel ${active === "corporate" ? "is-active" : ""}`}
        >
          {isHome ? (
            <CorporateHomeTab services={corporateServices} visualHighlights={visualHighlights} />
          ) : (
            <ServicesTabServiceGrid services={servicesTabPartitions.corporate} />
          )}
        </div>
      </div>
    </section>
  );
}

function partitionForServicesTab(services) {
  const list = Array.isArray(services) ? services : [];
  const pick = (hrefs) => hrefs.map((h) => list.find((s) => s.href === h)).filter(Boolean);
  return {
    general: pick([
      "/skilled-migration",
      "/partner-visa-australia",
      "/visitor-visas",
      "/australian-visas-official-sources",
    ]),
    education: pick(["/student-visa-australia"]),
    corporate: pick(["/employer-sponsored-visas"]),
  };
}

function ServicesTabServiceGrid({ services }) {
  if (!services.length) {
    return <p className="home-services-tabs__empty">No services in this category.</p>;
  }
  return (
    <div className="services-layout home-services-tabs__services-layout">
      {services.map((service) => (
        <Link key={service.title} href={service.href} className="service-block bento-hover service-block__link">
          <span className="service-block__eyebrow">Specialist pathway</span>
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
          <ul className="feature-list">
            {service.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="service-block__linkline">
            Learn more <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function GeneralMigrationHomeTab({ quickServiceCards, featured, visualHighlights, officialExtra }) {
  return (
    <div className="home-services-tabs__home-body">
      <div className="home-services-tabs__quick-grid">
        {quickServiceCards.map((item) => (
          <Link key={item.href} href={item.href} className="home-services-tabs__quick-card bento-hover">
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <span className="home-services-tabs__quick-more">
              Learn more <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>

      <nav className="home-services-tabs__pills" aria-label="Popular visa topics">
        <Link href="/#services" className="home-services-tabs__pill home-services-tabs__pill--accent">
          All pathways
        </Link>
        <Link href="/skilled-migration" className="home-services-tabs__pill">
          Skilled
        </Link>
        <Link href="/partner-visa-australia" className="home-services-tabs__pill">
          Partner
        </Link>
        <Link href="/visitor-visas" className="home-services-tabs__pill">
          Visitor
        </Link>
        <Link href="/student-visa-australia" className="home-services-tabs__pill">
          Student
        </Link>
      </nav>

      <p className="home-services-tabs__lede">
        Looking for a migration agent in Australia? Compare skilled, partner, and visitor routes here — then use{" "}
        <Link href="/#quiz" className="home-services-tabs__inline-link">
          Start Free Assessment
        </Link>{" "}
        or{" "}
        <Link href="/#smart-navigator" className="home-services-tabs__inline-link">
          Smart Navigator
        </Link>{" "}
        when you want a shortlist.
      </p>

      <div className="home-services-tabs__visual-grid">
        {featured.map((service, index) => {
          const highlight = visualHighlights[index] ?? visualHighlights[0];
          const offerBadges = ["Popular", "Guided", "Verified planning"];
          const badge = offerBadges[index] ?? "Featured";
          return (
            <article
              key={service.href}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-brand-plum/10 backdrop-blur-md transition duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-brand-plum/15"
            >
              <Link
                href={service.href}
                className="relative z-0 flex h-full min-h-0 flex-col rounded-3xl no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
              >
                <div className="relative h-52 shrink-0 overflow-hidden bg-brand-cream sm:h-56">
                  <Image
                    src={highlight.src}
                    alt={highlight.alt}
                    width={1400}
                    height={1000}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex grow flex-col p-5 sm:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-gold">{highlight.title}</p>
                  <h3 className="mb-3 text-lg font-bold leading-snug text-brand-plum sm:text-xl">{service.title}</h3>
                  <p className="mb-4 rounded-r-lg border-l-2 border-brand-gold bg-brand-cream/60 py-1 pl-3 text-sm italic text-brand-plum/65">
                    &ldquo;{highlight.caption}&rdquo;
                  </p>
                  <p className="mb-4 flex-grow text-sm leading-relaxed text-brand-plum/75 transition group-hover:text-brand-plum">
                    {service.summary}
                  </p>
                  <div className="mt-auto flex items-center text-sm font-bold tracking-wide text-brand-rose transition group-hover:text-brand-plum">
                    Learn more
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                      →
                    </span>
                  </div>
                </div>
              </Link>
              <span
                className="pointer-events-none absolute right-3 top-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] rounded-full bg-brand-rose px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md"
                aria-hidden
              >
                {badge}
              </span>
            </article>
          );
        })}
      </div>

      {officialExtra ? (
        <div className="home-services-tabs__official-cta">
          <Link href={officialExtra.href} className="home-services-tabs__official-link bento-hover">
            <strong>{officialExtra.title}</strong>
            <span>{officialExtra.summary}</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function EducationHomeTab({ services, visualHighlights }) {
  const highlight = visualHighlights[1] ?? visualHighlights[0];
  const service = services[0];
  if (!service) {
    return <p className="home-services-tabs__empty">Education services coming soon.</p>;
  }
  return (
    <div className="home-services-tabs__home-body home-services-tabs__home-body--single">
      <article className="group relative flex max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-brand-plum/10 backdrop-blur-md sm:mx-auto md:flex-row">
        <Link
          href={service.href}
          className="relative flex min-h-0 flex-1 flex-col no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold md:flex-row md:items-stretch"
        >
          <div className="relative h-56 shrink-0 overflow-hidden bg-brand-cream md:h-auto md:w-1/2 md:min-h-[280px]">
            <Image
              src={highlight.src}
              alt={highlight.alt}
              width={1400}
              height={1000}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-gold">Study pathways</p>
            <h3 className="mb-4 text-2xl font-bold text-brand-plum">{service.title}</h3>
            <p className="mb-6 leading-relaxed text-brand-plum/75">{service.summary}</p>
            <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-brand-plum/80">
              {service.highlights.slice(0, 4).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <span className="mt-auto font-bold text-brand-rose">
              Learn more <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      </article>
      <div className="home-services-tabs__secondary-row">
        <Link href="/education-consultation" className="home-services-tabs__secondary-card bento-hover">
          <h3 className="text-lg font-bold text-brand-plum">Education consultation</h3>
          <p className="mt-2 text-sm text-brand-plum/75">
            Course and visa timing planning before you commit to enrolment or a visa strategy.
          </p>
          <span className="mt-4 text-sm font-bold text-brand-rose">Book education consult →</span>
        </Link>
      </div>
    </div>
  );
}

function CorporateHomeTab({ services, visualHighlights }) {
  const highlight = visualHighlights[2] ?? visualHighlights[0];
  const service = services[0];
  if (!service) {
    return <p className="home-services-tabs__empty">Corporate solutions coming soon.</p>;
  }
  return (
    <div className="home-services-tabs__home-body home-services-tabs__home-body--single">
      <article className="group relative flex max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-brand-plum/10 backdrop-blur-md sm:mx-auto md:flex-row">
        <Link
          href={service.href}
          className="relative flex min-h-0 flex-1 flex-col no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold md:flex-row md:items-stretch"
        >
          <div className="relative h-56 shrink-0 overflow-hidden bg-brand-cream md:h-auto md:w-1/2 md:min-h-[280px]">
            <Image
              src={highlight.src}
              alt={highlight.alt}
              width={1400}
              height={1000}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-gold">Employer-backed</p>
            <h3 className="mb-4 text-2xl font-bold text-brand-plum">{service.title}</h3>
            <p className="mb-6 leading-relaxed text-brand-plum/75">{service.summary}</p>
            <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-brand-plum/80">
              {service.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <span className="mt-auto font-bold text-brand-rose">
              Learn more <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      </article>
      <div className="home-services-tabs__secondary-row">
        <Link href="/book-consultation" className="home-services-tabs__secondary-card bento-hover">
          <h3 className="text-lg font-bold text-brand-plum">Brief us on workforce needs</h3>
          <p className="mt-2 text-sm text-brand-plum/75">
            Book a consultation when sponsorship timelines, occupation fit, or compliance questions need a structured
            conversation.
          </p>
          <span className="mt-4 text-sm font-bold text-brand-rose">Book consultation →</span>
        </Link>
      </div>
    </div>
  );
}
