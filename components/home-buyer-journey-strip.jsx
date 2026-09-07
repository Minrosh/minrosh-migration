"use client";

import { TrackedLink } from "./tracked-link";

const MAROON = "var(--brand-rose)";

const STEPS = [
  {
    kicker: "Step 1",
    title: "Choose a topic",
    body: "Select a visa category or education topic you want to understand from publicly available information.",
    chips: ["Study", "Skilled", "Partner", "Work", "Visit"],
  },
  {
    kicker: "Step 2",
    title: "Read a general summary",
    body: "Review neutral overviews that organise public criteria, fees pages, and official programme outlines.",
    chips: ["Criteria", "Fees", "Sources", "Timing"],
  },
  {
    kicker: "Step 3",
    title: "Verify official sources",
    body: "Follow Home Affairs and other institutional links and confirm current requirements yourself before acting.",
    chips: ["Home Affairs", "Lists", "Forms", "Updates"],
  },
  {
    kicker: "Step 4",
    title: "Seek authorised help if needed",
    body: "For advice based on your circumstances or help with an application, contact a registered migration agent or Australian legal practitioner. MinRosh does not provide immigration assistance.",
    chips: ["OMARA register", "Legal practitioner", "Education enquiry", "Contact"],
  },
];

function Chip({ children }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ borderColor: `${MAROON}33`, color: MAROON, backgroundColor: "#ffffff" }}
    >
      {children}
    </span>
  );
}

export function HomeBuyerJourneyStrip() {
  return (
    <section className="home-section" aria-labelledby="home-journey-heading">
      <div className="relative isolate mx-auto w-full min-w-0 overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-gradient-to-b from-[#FBF6F4]/85 via-white to-[#FBF6F4]/75 p-5 shadow-[var(--shadow-lux)] sm:p-7">
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
          aria-hidden
          style={{
            background:
              "radial-gradient(130% 100% at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%), radial-gradient(120% 100% at 50% 100%, rgba(136,19,55,0.06) 0%, rgba(136,19,55,0) 65%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full min-w-0">
          <p
            className="text-center text-[11px] font-bold uppercase tracking-[0.28em]"
            style={{ color: MAROON }}
          >
            General information first
          </p>
          <h2
            id="home-journey-heading"
            className="mt-3 text-center text-2xl font-bold tracking-tight text-brand-plum sm:text-3xl md:text-[2.15rem] md:leading-tight"
            style={{ fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            How MinRosh works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
            A simple sequence for finding public information and official links. This is not an eligibility assessment,
            visa recommendation, or immigration assistance.
          </p>

          <ol className="mx-auto mt-10 list-none space-y-6 pl-0 md:mt-12 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step) => (
              <li key={step.kicker} className="home-journey-card min-w-0">
                <div className="flex h-full min-h-[248px] flex-col rounded-[1.5rem] border border-brand-plum/10 bg-white p-6 shadow-[var(--shadow-lux)] transition-shadow duration-300 hover:shadow-[var(--shadow-lux-lg)] sm:p-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: MAROON }}>
                    {step.kicker}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-brand-plum sm:text-xl">{step.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.chips.map((c) => (
                      <Chip key={c}>{c}</Chip>
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-brand-plum/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex min-w-0 flex-col gap-3 sm:mx-auto sm:mt-12 sm:max-w-2xl sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <TrackedLink
              id="journey-cta-information-finder"
              href="/assessment"
              eventName="cta_click"
              eventParams={{
                cta_id: "journey_information_finder",
                cta_location: "home_journey_strip",
                destination: "/assessment",
              }}
              aria-label="Open Official Information Finder"
              className="btn flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-full px-8 py-3.5 text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.28)] active:scale-[0.98] sm:w-auto sm:text-lg"
              style={{ backgroundColor: MAROON }}
            >
              Explore General Information
              <span className="ml-2 inline-block" aria-hidden="true">
                →
              </span>
            </TrackedLink>
            <TrackedLink
              id="journey-cta-education"
              href="/education-consultation"
              eventName="cta_click"
              eventParams={{
                cta_id: "journey_education_enquiry",
                cta_location: "home_journey_strip",
                destination: "/education-consultation",
              }}
              aria-label="Education Course Enquiry"
              className="premium-frosted-surface btn flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-full border-2 border-brand-rose/25 px-8 py-3.5 text-base font-bold text-brand-plum transition-all hover:border-brand-rose/45 active:scale-[0.98] sm:w-auto sm:text-lg"
            >
              Education Course Enquiry
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
