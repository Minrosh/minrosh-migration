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
      <section className="home-section relative isolate overflow-x-clip rounded-[2rem] border border-brand-plum/10 bg-gradient-to-b from-[#FBF6F4]/85 via-white to-[#FBF6F4]/75 p-5 shadow-[var(--shadow-lux)] sm:p-7">
        <div className="mx-auto w-full min-w-0">
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
            aria-hidden
            style={{
              background:
                "radial-gradient(130% 100% at 50% 0%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 62%), radial-gradient(120% 100% at 50% 100%, rgba(136,19,55,0.05) 0%, rgba(136,19,55,0) 65%)",
            }}
          />
          <div className="relative z-10 mx-auto w-full min-w-0">
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

          </div>
        </div>
      </section>

      <section className="home-section relative isolate overflow-x-clip rounded-[2rem] border border-brand-plum/8 bg-gradient-to-b from-white/90 via-[#FBF6F4]/60 to-white/90 p-4 shadow-sm sm:p-6">
        <div className="relative z-10 mx-auto w-full min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-plum/50 sm:text-xs">
                News &amp; updates
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-brand-plum sm:text-2xl">
                Immigration news
              </h2>
            </div>
            <Link
              href="/immigration-news"
              className="inline-flex min-h-[48px] touch-manipulation items-center text-sm font-bold text-brand-plum underline decoration-2 underline-offset-8 transition-colors hover:text-brand-rose"
            >
              View all news <span className="ml-2">→</span>
            </Link>
          </div>

          <div className="relative">
            <ul className="relative z-10 grid min-w-0 list-none grid-cols-1 gap-4 pl-0 sm:grid-cols-2 lg:grid-cols-4">
              {newsItems.map((item) => (
                <li key={item.id} className="min-w-0">
                  <Link href={item.href} className="group block h-full">
                    <div className="flex h-full flex-col rounded-2xl border border-brand-plum/[0.06] bg-white/95 p-5 shadow-sm transition-all hover:border-brand-rose/20 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-brand-plum/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-plum">
                          {item.country}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-brand-plum/40">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="mb-3 text-base font-bold leading-tight text-brand-plum transition-colors group-hover:text-brand-rose">
                        {item.title}
                      </h3>
                      <p className="mb-4 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/55">
                        {item.summary}
                      </p>
                      <div className="mt-auto flex min-h-[44px] items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-plum/70 transition-all group-hover:gap-3">
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
