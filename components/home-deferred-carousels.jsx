"use client";

import Link from "next/link";

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
          <div className="text-center">
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
          </div>

          <div className="relative mt-8 sm:mt-10">
            <ul
              className="-mx-1 flex list-none snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-1 pb-8 pl-0 [-webkit-overflow-scrolling:touch] no-scrollbar sm:gap-6 lg:snap-none lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:pb-6 xl:grid-cols-4"
              aria-label="Client feedback quotes"
            >
              {FEEDBACK.map((item) => (
                <li
                  key={`${item.name}-${item.context}`}
                  className="w-[min(calc(100vw-2rem),22rem)] shrink-0 snap-center lg:w-auto lg:min-w-0"
                >
                  <figure className="glass-card flex h-full min-h-[200px] flex-col rounded-[1.75rem] border border-brand-plum/[0.07] bg-white/92 p-6 shadow-[var(--shadow-lux)] sm:p-8">
                    <blockquote className="flex-1 text-[15px] font-semibold italic leading-relaxed text-brand-plum sm:text-lg">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 border-t border-brand-plum/10 pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-rose sm:text-xs">
                      {item.name} · {item.context}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-center text-xs font-medium leading-relaxed text-brand-plum/55">
            MinRosh maintains OMARA-aligned practices and cites departmental guidance—always confirm requirements on
            official immigration websites.
          </p>
        </div>
      </section>

      <section className="home-section bg-white overflow-x-clip">
        <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-6 sm:mb-10 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-rose sm:text-xs">
                Knowledge base
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl">
                Latest insights
              </h2>
            </div>
            <Link
              href="/immigration-news"
              className="inline-flex min-h-[48px] touch-manipulation items-center font-black text-brand-plum underline decoration-2 underline-offset-8 transition-colors hover:text-brand-rose"
            >
              View all news <span className="ml-2">→</span>
            </Link>
          </div>

          <div className="relative">
            <ul className="flex list-none gap-5 overflow-x-auto pb-6 pl-0 sm:gap-6 px-1 sm:px-0 snap-x snap-mandatory no-scrollbar">
              {newsItems.map((item) => (
                <li key={item.id} className="w-[min(calc(100vw-2.5rem),380px)] shrink-0 snap-center sm:w-[380px]">
                  <Link href={item.href} className="group block h-full">
                    <div className="glass-card flex h-full flex-col rounded-[1.75rem] border border-brand-plum/[0.06] bg-white/95 p-6 shadow-[var(--shadow-lux)] transition-all hover:border-brand-rose/25 hover:bg-[#FBF6F4]/40 hover:shadow-[var(--shadow-lux-lg)] sm:p-8">
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
