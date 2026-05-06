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
              Pathway questionnaire
            </p>
            <h2 id="home-quiz-heading" className="mt-4 text-2xl font-bold tracking-tight text-brand-plum sm:text-3xl">
              Start your free pathway check
            </h2>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-brand-plum/75 sm:text-base">
              Use our structured questionnaire to map your possible next step across Australia, Canada, the UK, and New
              Zealand. Results are indicative planning guidance based on your inputs and should be confirmed with official
              rules and case-specific advice.
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
                  cta_id: "home_quiz_entry_assessment",
                  cta_location: "home_quiz_entry",
                  destination: "/assessment",
                }}
                aria-label="Start free pathway check"
                className="home-hero-premium__cta inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-center text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.22)] outline-none ring-offset-2 ring-offset-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.3)] focus-visible:ring-2 focus-visible:ring-brand-rose/45"
              >
                Start Free Pathway Check
              </TrackedLink>
              <TrackedLink
                id="home-quiz-entry-secondary"
                href="/book-consultation"
                eventName="cta_click"
                eventParams={{
                  cta_id: "home_quiz_entry_book_consultation",
                  cta_location: "home_quiz_entry",
                  destination: "/book-consultation",
                }}
                aria-label="Book consultation with MinRosh Migration"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-brand-plum/18 bg-white px-7 py-3.5 text-center text-base font-bold text-brand-plum transition-all duration-300 hover:border-brand-rose/45 hover:text-brand-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose/35"
              >
                Book Consultation
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
