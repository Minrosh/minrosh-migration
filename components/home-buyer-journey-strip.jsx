"use client";

import { TrackedLink } from "./tracked-link";

const MAROON = "#8B1D41";

const STEPS = [
  {
    kicker: "Step 1",
    title: "Define your goal",
    body: "Clarify whether you are leaning toward study, skilled migration, partner reunion, employer-sponsored support or an exploratory visit—then we map what to read next.",
    chips: ["Study", "Migrate", "Work", "Partner", "Visit"],
  },
  {
    kicker: "Step 2",
    title: "Shape your pathway lens",
    body: "Stress-test timing, skills context and location preferences against official programme outlines—not quick guarantees—so your next steps stay grounded.",
    chips: ["Points", "Skills", "Location", "Timing"],
  },
  {
    kicker: "Step 3",
    title: "Pick your next action",
    body: "Move into the pathway questionnaire for indicative sequencing, browse hubs for detail, or book a consultation when you want case-specific guidance.",
    chips: ["Plan", "Documents", "Timeline", "Advice"],
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
    <section
      className="home-section border-y border-brand-plum/[0.08] bg-gradient-to-b from-[#FBF6F4] via-white to-[#FBF6F4]/90"
      aria-labelledby="home-journey-heading"
    >
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p
          className="text-center text-[11px] font-bold uppercase tracking-[0.28em]"
          style={{ color: MAROON }}
        >
          Visa planning made easy
        </p>
        <h2
          id="home-journey-heading"
          className="mt-3 text-center text-2xl font-bold tracking-tight text-[#1f1020] sm:text-3xl md:text-[2.15rem] md:leading-tight"
          style={{ fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif" }}
        >
          Compare pathways in one clear flow
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-medium leading-relaxed text-[#1f1020]/72 sm:text-base">
          A calm sequence for offshore and onshore applicants. Information stays indicative until your circumstances are
          reviewed in consultation—not outcome guarantees.
        </p>

        <ol className="mt-10 list-none space-y-6 pl-0 md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
          {STEPS.map((step) => (
            <li key={step.kicker} className="home-journey-card min-w-0">
              <div className="flex h-full flex-col rounded-[1.75rem] border border-brand-plum/10 bg-white p-6 shadow-[var(--shadow-lux)] transition-shadow duration-300 hover:shadow-[var(--shadow-lux-lg)] sm:p-7">
                <span className="text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: MAROON }}>
                  {step.kicker}
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#1f1020] sm:text-xl">{step.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.chips.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-[#1f1020]/70">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex min-w-0 flex-col gap-3 sm:mx-auto sm:mt-12 sm:max-w-2xl sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <TrackedLink
            id="journey-cta-questionnaire"
            href="/assessment"
            eventName="cta_click"
            eventParams={{
              cta_id: "journey_pathway_questionnaire",
              cta_location: "home_journey_strip",
              destination: "/assessment",
            }}
            aria-label="Start the pathway questionnaire"
            className="btn flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-full px-8 py-3.5 text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.28)] active:scale-[0.98] sm:w-auto sm:text-lg"
            style={{ backgroundColor: MAROON }}
          >
            Start the pathway questionnaire
            <span className="ml-2 inline-block" aria-hidden="true">
              →
            </span>
          </TrackedLink>
          <TrackedLink
            id="journey-cta-global-pathways"
            href="/global-pathways"
            eventName="cta_click"
            eventParams={{
              cta_id: "journey_compare_pathways",
              cta_location: "home_journey_strip",
              destination: "/global-pathways",
            }}
            aria-label="Compare visa pathways"
            className="btn flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-full border-2 border-[#881337]/25 bg-white px-8 py-3.5 text-base font-bold text-[#1f1020] transition-all hover:border-[#881337]/45 hover:bg-zinc-50 active:scale-[0.98] sm:w-auto sm:text-lg"
          >
            Compare visa pathways
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
