"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "../../lib/utils";

function formatWeekly(symbol, currency, amount) {
  if (amount == null || Number.isNaN(amount)) {
    return "See hub calculator";
  }
  try {
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted}/wk illustrative`;
  } catch {
    return `${symbol}${amount}/wk illustrative`;
  }
}

/**
 * @param {{ data: { eyebrow?: string; title: string; lead?: string; disclaimer?: string; currency: string; symbol: string; licenceBlurb?: string; officialLinks?: Array<{ label: string; href: string }>; cities: Array<{ id: string; name: string; modeMix: string; weeklyCommuteIllustrative: number | null; licenceNote: string }> } | null }} props
 */
export function TransportMoveStrip({ data }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduce = useReducedMotion();

  if (!data?.cities?.length) return null;

  return (
    <section
      ref={ref}
      id="move-around"
      className="rounded-3xl border border-brand-plum/[0.08] bg-gradient-to-b from-white/95 to-[#fff9f4]/90 p-8 shadow-[0_8px_40px_rgba(61,36,50,0.06)] backdrop-blur-sm"
      aria-labelledby="transport-strip-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">{data.eyebrow || "Move around"}</p>
          <h3 id="transport-strip-heading" className="text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
            {data.title}
          </h3>
          {data.lead ? <p className="text-base leading-relaxed text-brand-plum/65">{data.lead}</p> : null}
          {data.disclaimer ? <p className="text-xs leading-relaxed text-brand-plum/50">{data.disclaimer}</p> : null}
        </div>
        {data.licenceBlurb ? (
          <p className="max-w-md rounded-2xl border border-brand-plum/10 bg-white/70 p-5 text-sm leading-relaxed text-brand-plum/70 shadow-sm lg:text-right">
            {data.licenceBlurb}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.cities.map((city, i) => (
          <motion.article
            key={city.id}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "min-w-[min(100%,280px)] shrink-0 rounded-2xl border border-brand-plum/[0.08] bg-white/90 p-6 shadow-[0_6px_24px_rgba(61,36,50,0.05)] transition-all duration-300 ease-out",
              "hover:-translate-y-1 hover:border-brand-rose/25 hover:shadow-xl focus-within:ring-2 focus-within:ring-brand-rose/30 focus-within:ring-offset-2"
            )}
          >
            <h4 className="text-lg font-semibold tracking-tight text-brand-plum">{city.name}</h4>
            <p className="mt-2 text-sm font-medium text-brand-rose/90">
              {formatWeekly(data.symbol, data.currency, city.weeklyCommuteIllustrative)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-plum/65">{city.modeMix}</p>
            <p className="mt-4 border-t border-brand-plum/10 pt-4 text-xs leading-relaxed text-brand-plum/55">{city.licenceNote}</p>
          </motion.article>
        ))}
      </div>

      {data.officialLinks?.length ? (
        <ul className="mt-8 flex flex-wrap gap-3 border-t border-brand-plum/10 pt-6">
          {data.officialLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-brand-plum/12 bg-white/80 px-4 py-2 text-sm font-medium text-brand-plum/85 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-rose/35 hover:text-brand-plum focus:outline-none focus:ring-2 focus:ring-brand-rose/40 focus:ring-offset-2"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
