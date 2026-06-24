"use client";

import { TrackedLink } from "./tracked-link";

export function HomeFinalCta() {
  return (
    <section className="home-section relative overflow-hidden rounded-[2rem] border border-white/20 bg-brand-plum shadow-[var(--shadow-lux)] overflow-x-clip text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-[20%] top-0 h-[320px] w-[320px] rounded-full bg-brand-rose/30 blur-[80px]" />
        <div className="absolute -right-[10%] bottom-0 h-[280px] w-[280px] rounded-full bg-brand-gold/25 blur-[70px]" />
      </div>

      <div className="relative z-10 mx-auto w-full min-w-0 py-14 text-center sm:py-16 lg:py-20">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold sm:text-xs">Next step</p>
        <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          Not sure where to start?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-brand-cream/85 sm:text-base">
          Take the 2-minute pathway check for indicative direction, or book a consultation when you want tailored
          guidance. Neither replaces official departmental decisions.
        </p>

        <div className="mx-auto mt-10 flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <TrackedLink
            id="footer-cta-questionnaire"
            href="/assessment"
            eventName="cta_click"
            eventParams={{
              cta_id: "footer_pathway_questionnaire",
              cta_location: "home_footer",
              destination: "/assessment",
            }}
            aria-label="Start the pathway questionnaire from homepage footer"
            className="btn flex min-h-[48px] w-full touch-manipulation items-center justify-center bg-white px-8 py-4 text-base font-black text-brand-plum shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto sm:text-lg"
          >
            Start Free Pathway Check
          </TrackedLink>
          <TrackedLink
            id="footer-cta-consultation"
            href="/book-consultation"
            eventName="cta_click"
            eventParams={{
              cta_id: "footer_book_consultation",
              cta_location: "home_footer",
              destination: "/book-consultation",
            }}
            aria-label="Book a consultation from homepage footer"
            className="btn flex min-h-[48px] w-full touch-manipulation items-center justify-center border-2 border-white/50 bg-white/15 px-8 py-4 text-base font-black text-white backdrop-blur-[20px] transition-all hover:border-white/65 hover:bg-white/22 sm:w-auto sm:text-lg"
          >
            Book a consultation
          </TrackedLink>
        </div>

        <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.35em] text-brand-cream/55">
          Brisbane-based team · Online consultations worldwide
        </p>
      </div>
    </section>
  );
}
