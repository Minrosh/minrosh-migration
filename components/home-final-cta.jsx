"use client";

import { MotionReveal } from "./ui/motion-wrapper";
import { TrackedLink } from "./tracked-link";

export function HomeFinalCta() {
  return (
    <section className="home-section bg-brand-plum relative overflow-x-clip text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-[20%] top-0 h-[320px] w-[320px] rounded-full bg-brand-rose/25 blur-[80px]" />
        <div className="absolute -right-[10%] bottom-0 h-[280px] w-[280px] rounded-full bg-brand-gold/15 blur-[70px]" />
      </div>

      <div className="relative z-10 mx-auto min-w-0 max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
        <MotionReveal y={18}>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold sm:text-xs">Next step</p>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Ready to plan your next steps?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-brand-cream/75 sm:text-base">
            Use the questionnaire for indicative direction, or book a consultation when you want tailored guidance.
            Neither replaces official departmental decisions.
          </p>
        </MotionReveal>

        <MotionReveal delay={0.08} y={20}>
          <div className="mt-10 flex min-w-0 flex-wrap justify-center gap-4">
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
              className="btn min-h-[48px] touch-manipulation bg-white px-8 py-4 text-base font-black text-brand-plum shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] sm:text-lg"
            >
              Start the pathway questionnaire
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
              className="btn min-h-[48px] touch-manipulation border-2 border-white/35 bg-transparent px-8 py-4 text-base font-black text-white transition-all hover:bg-white/10 sm:text-lg"
            >
              Book a consultation
            </TrackedLink>
          </div>
        </MotionReveal>

        <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.35em] text-brand-cream/45">
          Brisbane-based team · Online consultations worldwide
        </p>
      </div>
    </section>
  );
}
