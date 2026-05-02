"use client";

import Link from "next/link";
import { MotionReveal } from "./ui/motion-wrapper";

const FEEDBACK = [
  {
    name: "Ahmed",
    context: "Skilled pathway planning",
    quote:
      "The team walked through nomination options and official references clearly—I understood what to verify next.",
  },
  {
    name: "Sarah",
    context: "Partner visa preparation",
    quote:
      "They helped me organise relationship evidence and present it consistently—professional structure throughout.",
  },
  {
    name: "R. Fernando",
    context: "Points and sequencing discussion",
    quote:
      "The structured review made next steps manageable. We focused on improvements against published criteria—not guesses.",
  },
  {
    name: "S. Wick",
    context: "Student visa preparation",
    quote:
      "Clear explanations on course fit and paperwork expectations before lodging—I knew what departments looked for.",
  },
];

export function HomeDeferredCarousels({ newsItems = [] }) {
  return (
    <>
      <section className="home-section bg-brand-cream/30 overflow-x-clip">
        <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionReveal className="text-center" y={16}>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-rose sm:text-xs">Trust</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl">
              Client feedback
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
              Quotes describe past clients&apos; experience of working with MinRosh—organisation, clarity and process
              support. They are{" "}
              <strong className="font-black text-brand-plum">not promises about future visa grants or outcomes.</strong>{" "}
              Individual results depend on your facts and current immigration rules.
            </p>
          </MotionReveal>

          <div className="relative mt-10">
            <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4 sm:-mx-0 sm:px-0">
              {FEEDBACK.map((item) => (
                <div key={`${item.name}-${item.context}`} className="w-[85%] flex-none snap-center sm:w-[min(100%,420px)]">
                  <figure className="glass-card flex h-full flex-col border border-white/50 p-6 shadow-lg sm:p-8">
                    <blockquote className="flex-1 text-base font-semibold italic leading-relaxed text-brand-plum sm:text-lg">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 border-t border-brand-plum/10 pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-rose sm:text-xs">
                      {item.name} · {item.context}
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-medium leading-relaxed text-brand-plum/55">
            MinRosh maintains OMARA-aligned practices and cites departmental guidance—always confirm requirements on
            official immigration websites.
          </p>
        </div>
      </section>

      <section className="home-section bg-white overflow-x-clip">
        <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <MotionReveal y={16}>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-rose sm:text-xs">
                Knowledge base
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl">
                Latest insights
              </h2>
            </MotionReveal>
            <MotionReveal delay={0.06} y={12}>
              <Link
                href="/immigration-news"
                className="inline-flex min-h-[48px] touch-manipulation items-center font-black text-brand-plum underline decoration-2 underline-offset-8 transition-colors hover:text-brand-rose"
              >
                View all news <span className="ml-2">→</span>
              </Link>
            </MotionReveal>
          </div>

          <div className="relative">
            <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:-mx-0 sm:px-0">
              {newsItems.map((item) => (
                <div key={item.id} className="w-[85%] flex-none snap-center sm:w-[380px]">
                  <Link href={item.href} className="group block h-full">
                    <div className="glass-card flex h-full flex-col border border-transparent p-6 shadow-lg transition-all hover:border-brand-rose/20 hover:bg-brand-cream/10 sm:p-8">
                      <div className="mb-6 flex items-center justify-between">
                        <span className="rounded-full bg-brand-plum/5 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-plum">
                          {item.country}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-plum/40">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="mb-4 text-xl font-black leading-tight text-brand-plum transition-colors group-hover:text-brand-rose">
                        {item.title}
                      </h3>
                      <p className="mb-8 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/55">
                        {item.summary}
                      </p>
                      <div className="mt-auto flex min-h-[48px] items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-plum transition-all group-hover:gap-3">
                        Read article <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
