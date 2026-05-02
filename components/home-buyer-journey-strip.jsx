"use client";

import { MotionReveal } from "./ui/motion-wrapper";
import { TrackedLink } from "./tracked-link";

const STEPS = [
  {
    kicker: "Step 1",
    title: "Choose your destination focus",
    body: "Open Australia, Canada, the UK or New Zealand hubs to compare study, skilled and family-style pathways.",
  },
  {
    kicker: "Step 2",
    title: "Map your pathway type",
    body: "Student, skilled, partner, employer-sponsored or visitor routes — identify what matches your situation on paper.",
  },
  {
    kicker: "Step 3",
    title: "Confirm next actions",
    body: "Use the pathway questionnaire for indicative direction, then book a consultation when you want case-specific guidance.",
  },
];

export function HomeBuyerJourneyStrip() {
  return (
    <section
      className="home-section bg-brand-cream/35 border-y border-brand-plum/[0.06]"
      aria-labelledby="home-journey-heading"
    >
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionReveal y={12}>
          <h2
            id="home-journey-heading"
            className="text-center text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl"
          >
            How to start
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
            A simple sequence for offshore and onshore applicants. Information is indicative until your circumstances are
            reviewed in consultation—not eligibility advice or outcome guarantees.
          </p>
        </MotionReveal>

        <ol className="mt-10 grid min-w-0 gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <MotionReveal key={step.kicker} delay={i * 0.06} y={14}>
              <li className="home-journey-card flex h-full flex-col rounded-2xl border border-brand-plum/10 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-rose">{step.kicker}</span>
                <h3 className="mt-2 text-lg font-black text-brand-plum">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65">{step.body}</p>
              </li>
            </MotionReveal>
          ))}
        </ol>

        <MotionReveal delay={0.12} y={12}>
          <div className="mt-10 flex min-w-0 flex-wrap justify-center gap-4">
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
              className="btn min-h-[48px] touch-manipulation bg-brand-plum px-6 py-3 text-base font-black text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] sm:px-8 sm:text-lg"
            >
              Start the pathway questionnaire
              <span className="ml-2 inline-block" aria-hidden="true">
                →
              </span>
            </TrackedLink>
            <TrackedLink
              id="journey-cta-consultation"
              href="/book-consultation"
              eventName="cta_click"
              eventParams={{
                cta_id: "journey_book_consultation",
                cta_location: "home_journey_strip",
                destination: "/book-consultation",
              }}
              aria-label="Book a migration consultation"
              className="btn btn-ghost min-h-[48px] touch-manipulation border-2 border-brand-plum/20 px-6 py-3 text-base font-black text-brand-plum transition-all hover:border-brand-plum/40 hover:bg-brand-cream/50 sm:px-8 sm:text-lg"
            >
              Book a consultation
            </TrackedLink>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
