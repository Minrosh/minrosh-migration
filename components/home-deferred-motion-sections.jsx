"use client";

import Link from "next/link";
import { TrackedLink } from "./tracked-link";
import { MotionItem, MotionReveal, MotionStagger } from "./ui/motion-wrapper";

const PILLARS = [
  { title: "Evidence quality", desc: "We stress-test documents and story consistency before lodgement.", icon: "🛡️" },
  { title: "Timing & policy", desc: "We map realistic windows against current rules and lists.", icon: "⏰" },
  { title: "Points & pathways", desc: "Indicative points context—always checked against Home Affairs.", icon: "📈" },
  { title: "End-to-end support", desc: "From assessment through to decision-ready submissions.", icon: "🏛️" },
];

export function HomeDeferredMotionSections() {
  return (
    <>
      <section className="ultra-snap-section bg-brand-plum text-white overflow-x-clip overflow-y-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-brand-rose/10 rounded-full blur-[80px] sm:blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent -z-0" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <MotionReveal y={20}>
              <div className="flex flex-col justify-center h-full text-center lg:text-left">
                <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4">Why MinRosh?</p>
                <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl mb-6 leading-[1.1]">
                  Structured advice, <br />
                  <span className="text-brand-rose italic">clear next steps.</span>
                </h2>
                <p className="text-base sm:text-lg text-brand-cream/60 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium mb-8">
                  We focus on defensible evidence, realistic sequencing, and what Home Affairs expects to see—not
                  shortcuts or guarantees.
                </p>
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 opacity-80 grayscale-0 sm:grayscale sm:opacity-50 hover:grayscale-0 transition-all justify-center lg:justify-start mt-8 lg:mt-0">
                  <span className="text-4xl">🇦🇺</span>
                  <span className="text-4xl">🇨🇦</span>
                  <span className="text-4xl">🇬🇧</span>
                  <span className="text-4xl">🇳🇿</span>
                </div>
              </div>
            </MotionReveal>
            <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {PILLARS.map((item) => (
                <MotionItem key={item.title}>
                  <div className="glass-card !bg-white/5 border-white/10 p-6 sm:p-8 h-full hover:bg-white/10 transition-all hover:-translate-y-2 group text-center sm:text-left">
                    <span className="text-3xl sm:text-4xl block mb-4 group-hover:scale-125 transition-transform origin-center sm:origin-left">
                      {item.icon}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black mb-3">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-brand-cream/50 leading-relaxed">{item.desc}</p>
                  </div>
                </MotionItem>
              ))}
            </MotionStagger>
          </div>
        </div>
      </section>

      <section className="ultra-snap-section bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <MotionReveal y={20}>
            <h2 className="text-center text-3xl font-black text-brand-plum tracking-tighter mb-10 sm:mb-16 sm:text-5xl">
              Where we help most
            </h2>
          </MotionReveal>
          <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <MotionItem>
              <div className="glass-card !bg-brand-cream/60 p-6 sm:p-8 h-full flex flex-col justify-between group overflow-hidden relative border border-brand-cream/80">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl font-black leading-none">01</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-plum mb-3">Skilled Migration.</h3>
                  <p className="text-sm sm:text-base text-brand-plum/60 font-medium leading-relaxed">
                    Points-tested and employer-sponsored options, explained against current policy.
                  </p>
                </div>
                <Link
                  href="/skilled-migration"
                  className="mt-6 inline-flex min-h-[48px] touch-manipulation items-center font-black text-brand-rose gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8"
                >
                  View Skilled Hub <span>→</span>
                </Link>
              </div>
            </MotionItem>
            <MotionItem>
              <div className="glass-card !bg-brand-rose/15 p-6 sm:p-8 h-full flex flex-col justify-between group overflow-hidden relative border border-brand-rose/20">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl font-black leading-none">02</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-plum mb-3">Partner visas</h3>
                  <p className="text-sm sm:text-base text-brand-plum/60 font-medium leading-relaxed">
                    Relationship history, evidence gaps, and lodgement sequencing for partner subclasses.
                  </p>
                </div>
                <Link
                  href="/partner-visa-australia"
                  className="mt-6 inline-flex min-h-[48px] touch-manipulation items-center font-black text-brand-rose gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8"
                >
                  Partner Hub <span>→</span>
                </Link>
              </div>
            </MotionItem>
            <MotionItem>
              <div className="glass-card !bg-brand-gold/15 p-6 sm:p-8 h-full flex flex-col justify-between group overflow-hidden relative border border-brand-gold/20">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl font-black leading-none">03</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-plum mb-3">Student &amp; graduate</h3>
                  <p className="text-sm sm:text-base text-brand-plum/60 font-medium leading-relaxed">
                    Genuine student factors, course fit, and realistic post-study pathway discussions.
                  </p>
                </div>
                <Link
                  href="/student-visa-australia"
                  className="mt-6 inline-flex min-h-[48px] touch-manipulation items-center font-black text-brand-plum gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8"
                >
                  Student Hub <span>→</span>
                </Link>
              </div>
            </MotionItem>
            <MotionItem>
              <div className="glass-card !bg-brand-plum p-6 sm:p-8 h-full text-white group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl font-black leading-none">04</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black mb-3">Employer-sponsored</h3>
                  <p className="text-sm sm:text-base text-brand-cream/60 font-medium leading-relaxed">
                    Nominations, labour agreements, and compliance-heavy employer pathways when they fit your brief.
                  </p>
                </div>
              </div>
            </MotionItem>
          </MotionStagger>
        </div>
      </section>

      <section className="ultra-snap-section bg-brand-plum relative overflow-hidden">
        <div className="blur-orb bg-brand-rose/20 top-[-20%] left-[-20%]" />
        <div className="blur-orb bg-brand-gold/10 bottom-[-20%] right-[-20%]" />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 py-16 lg:py-24">
          <MotionReveal y={20}>
            <p className="text-brand-gold font-black uppercase tracking-[0.5em] text-[10px] sm:text-xs mb-6">
              Next step
            </p>
            <h2 className="text-4xl font-black text-white mb-8 sm:text-6xl md:text-7xl tracking-tight leading-none">
              Ready to <br />
              <span className="text-brand-rose">plan properly?</span>
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.1} y={30}>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12 sm:mt-16">
              <TrackedLink
                id="footer-cta-assessment"
                href="/assessment"
                eventName="cta_click"
                eventParams={{ cta_id: "footer_check_eligibility", cta_location: "home_footer", destination: "/assessment" }}
                aria-label="Check eligibility from homepage footer"
                className="btn min-h-[48px] bg-white px-10 py-5 sm:px-20 sm:py-10 text-xl sm:text-3xl font-black text-brand-plum shadow-[0_30px_100px_rgba(255,255,255,0.15)] transition-all hover:scale-110 active:scale-95"
              >
                Check Eligibility in 2 Minutes
              </TrackedLink>
            </div>
          </MotionReveal>
          <p className="mt-16 text-brand-cream/30 font-medium tracking-[0.4em] uppercase text-[10px]">
            Brisbane · Australia · Worldwide
          </p>
        </div>
      </section>
    </>
  );
}
