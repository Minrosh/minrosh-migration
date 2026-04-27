"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "../../lib/utils";

const toneStyles = {
  violet: "border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white shadow-[0_8px_30px_rgba(91,33,182,0.06)]",
  rose: "border-brand-rose/25 bg-gradient-to-br from-rose-50/90 to-white shadow-[0_8px_30px_rgba(155,74,108,0.08)]",
  amber: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white shadow-[0_8px_30px_rgba(217,119,6,0.06)]",
  emerald: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white shadow-[0_8px_30px_rgba(5,150,105,0.06)]",
  sky: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white shadow-[0_8px_30px_rgba(2,132,199,0.06)]",
};

/**
 * @param {{ data: { title: string; subtitle?: string; footnote?: string; milestones: Array<{ dayRange: string; title: string; body: string; tone?: string }> } | null }} props
 */
export function First14DaysTimeline({ data }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const reduce = useReducedMotion();

  if (!data?.milestones?.length) return null;

  return (
    <section
      ref={ref}
      id="first-14-days"
      className="relative overflow-hidden rounded-3xl border border-brand-plum/[0.08] bg-white/80 p-8 shadow-[0_8px_40px_rgba(61,36,50,0.07)] backdrop-blur-md"
      aria-labelledby="first-14-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-rose/[0.07] blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">Arrival arc</p>
        <h3 id="first-14-heading" className="text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
          {data.title}
        </h3>
        {data.subtitle ? (
          <p className="text-base leading-relaxed text-brand-plum/65">{data.subtitle}</p>
        ) : null}
      </div>

      <ol className="relative mt-10 space-y-0">
        <span
          className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-rose/35 via-brand-plum/15 to-transparent md:left-[23px]"
          aria-hidden
        />
        {data.milestones.map((m, i) => {
          const tone = toneStyles[m.tone] || toneStyles.violet;
          return (
            <motion.li
              key={`${m.dayRange}-${m.title}`}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : reduce ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid gap-6 pb-10 pl-14 md:grid-cols-[minmax(0,140px)_1fr] md:gap-8 md:pl-16 md:pb-12"
            >
              <span
                className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#fbf8f4] text-xs font-bold text-brand-rose shadow-md md:left-1 md:h-11 md:w-11"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="hidden text-sm font-semibold uppercase tracking-wide text-brand-plum/45 md:block">
                {m.dayRange}
              </div>
              <article
                className={cn(
                  "rounded-2xl border p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg md:col-start-2",
                  tone
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-rose md:hidden">{m.dayRange}</p>
                <h4 className="mt-1 text-lg font-semibold tracking-tight text-brand-plum">{m.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-brand-plum/70">{m.body}</p>
              </article>
            </motion.li>
          );
        })}
      </ol>

      {data.footnote ? (
        <p className="relative mt-2 text-xs leading-relaxed text-brand-plum/55">{data.footnote}</p>
      ) : null}
    </section>
  );
}
