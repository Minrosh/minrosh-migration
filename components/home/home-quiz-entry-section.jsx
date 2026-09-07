"use client";

import { TrackedLink } from "../tracked-link";

export function HomeQuizEntrySection() {
  return (
    <section
      id="quiz"
      className="home-section mt-8 scroll-mt-[calc(var(--site-header-chrome-height,var(--header-height,88px))+16px)]"
      aria-labelledby="home-quiz-heading"
    >
      <div className="rounded-[1.75rem] border border-brand-plum/10 bg-gradient-to-br from-white via-brand-cream/40 to-white p-6 shadow-[var(--shadow-lux)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-brand-rose/15 bg-brand-rose/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-rose">
              Official Information Finder
            </p>
            <h2 id="home-quiz-heading" className="mt-4 text-2xl font-bold tracking-tight text-brand-plum sm:text-3xl">
              Explore public information by topic
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-brand-plum/75 sm:text-base">
              Choose a broad topic to find general information and official links. This tool does not assess
              eligibility, recommend a visa, or provide immigration assistance.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-plum/10 bg-white/80 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-plum/55">Choose your next step</p>
            <div className="mt-4 flex flex-col gap-3">
              <TrackedLink
                id="home-quiz-entry-primary"
                href="/assessment"
                eventName="cta_click"
                eventParams={{
                  cta_id: "home_information_finder",
                  cta_location: "home_quiz_entry",
                  destination: "/assessment",
                }}
                aria-label="Open Official Information Finder"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-rose px-5 py-3 text-sm font-bold text-white transition hover:opacity-95"
              >
                Explore General Information →
              </TrackedLink>
              <TrackedLink
                id="home-quiz-entry-education"
                href="/education-consultation"
                eventName="cta_click"
                eventParams={{
                  cta_id: "home_education_enquiry",
                  cta_location: "home_quiz_entry",
                  destination: "/education-consultation",
                }}
                aria-label="Education course enquiry"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-brand-plum/20 bg-white px-5 py-3 text-sm font-bold text-brand-plum transition hover:bg-brand-cream/60"
              >
                Education Course Enquiry
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
