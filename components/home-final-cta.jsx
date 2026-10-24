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
          Explore general migration information from public sources, or submit an education-course enquiry. For
          personalised immigration assistance, contact a registered migration agent or Australian legal practitioner.
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-lg flex-col items-center gap-4">
          <TrackedLink
            id="footer-cta-questionnaire"
            href="/assessment"
            eventName="cta_click"
            eventParams={{
              cta_id: "footer_information_finder",
              cta_location: "home_footer",
              destination: "/assessment",
            }}
            className="btn flex min-h-[48px] w-full touch-manipulation items-center justify-center bg-white px-8 py-4 text-base font-black text-brand-plum shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto"
          >
            Explore General Information
          </TrackedLink>
          <TrackedLink
            id="footer-cta-consultation"
            href="/education-consultation"
            eventName="cta_click"
            eventParams={{
              cta_id: "footer_education_enquiry",
              cta_location: "home_footer",
              destination: "/education-consultation",
            }}
            className="inline-flex min-h-[44px] items-center text-sm font-bold text-white underline decoration-white/50 underline-offset-4"
          >
            Or send an education course enquiry
          </TrackedLink>
        </div>

        <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.35em] text-brand-cream/55">
          Brisbane-based · General information &amp; education support
        </p>
      </div>
    </section>
  );
}
