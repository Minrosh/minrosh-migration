"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { First14DaysTimeline } from "./first-14-days-timeline";
import { TransportMoveStrip } from "./transport-move-strip";
import { StudentJobBoardAu } from "./student-job-board-au";

const accentRing = {
  dawn: "border-amber-300/50 bg-gradient-to-br from-amber-50/95 to-white shadow-[0_6px_28px_rgba(217,119,6,0.08)]",
  transit: "border-brand-rose/30 bg-gradient-to-br from-rose-50/95 to-white shadow-[0_6px_28px_rgba(155,74,108,0.1)]",
  food: "border-[#caa64d]/45 bg-gradient-to-br from-[#fdf6e8] to-white shadow-[0_6px_28px_rgba(202,166,77,0.1)]",
  nature: "border-emerald-300/45 bg-gradient-to-br from-emerald-50/95 to-white shadow-[0_6px_28px_rgba(5,150,105,0.08)]",
  admin: "border-slate-200/90 bg-gradient-to-br from-slate-50/95 to-white shadow-[0_6px_28px_rgba(15,23,42,0.06)]",
  rest: "border-violet-200/70 bg-gradient-to-br from-violet-50/95 to-white shadow-[0_6px_28px_rgba(124,58,237,0.07)]",
};

const cardShell =
  "rounded-3xl border border-brand-plum/[0.08] bg-white/90 shadow-lux backdrop-blur-sm transition-all duration-300 ease-out hover:border-brand-plum/[0.12]";

function formatMoney(currency, value) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

function RangeField({ id, label, min, max, step, value, onChange, format }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-sm">
        <label htmlFor={id} className="font-semibold text-brand-plum/90">
          {label}
        </label>
        <span className="tabular-nums text-base font-semibold text-brand-rose">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lifestyle-range w-full accent-[#9b4a6c] focus:outline-none focus:ring-2 focus:ring-brand-rose/35 focus:ring-offset-2"
      />
    </div>
  );
}

function CostOfLivingCalculator({ col }) {
  const incomeCfg = col.income;
  const rentCfg = col.rentSlider;
  const [income, setIncome] = useState(incomeCfg.default);
  const [rent, setRent] = useState(rentCfg.default);
  const [groceries, setGroceries] = useState(col.groceries.default);
  const [transport, setTransport] = useState(col.transport.default);

  const applyPreset = useCallback((r) => {
    setRent(r);
  }, []);

  const totalExp = rent + groceries + transport;
  const surplus = income - totalExp;
  const fmt = useCallback((v) => formatMoney(col.currency, v), [col.currency]);

  const segments = useMemo(() => {
    const safe = Math.max(income, 1);
    return [
      { key: "rent", label: "Rent", value: rent, pct: (rent / safe) * 100, tone: "bg-brand-rose/85" },
      { key: "food", label: "Groceries", value: groceries, pct: (groceries / safe) * 100, tone: "bg-[#caa64d]/90" },
      { key: "move", label: "Transport", value: transport, pct: (transport / safe) * 100, tone: "bg-brand-plum/55" },
      {
        key: "surplus",
        label: surplus >= 0 ? "Buffer" : "Shortfall",
        value: Math.abs(surplus),
        pct: (Math.abs(surplus) / safe) * 100,
        tone: surplus >= 0 ? "bg-emerald-500/80" : "bg-red-500/85",
      },
    ];
  }, [income, rent, groceries, transport, surplus]);

  return (
    <div className={cn(cardShell, "p-8")}>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">Cost of living lab</p>
        <h3 className="text-2xl font-semibold tracking-tight text-brand-plum">Income vs everyday spend</h3>
        <p className="text-base leading-relaxed text-brand-plum/60">{col.period}</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {col.rentPresets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.rent)}
            className={cn(
              "min-h-[48px] touch-manipulation rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-rose/40 focus:ring-offset-2",
              rent === p.rent
                ? "border-brand-rose bg-brand-rose text-white shadow-md"
                : "border-brand-plum/12 bg-brand-cream/80 text-brand-plum/80 hover:-translate-y-0.5 hover:border-brand-rose/35 hover:shadow-md"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <RangeField
          id="lifestyle-income"
          label={incomeCfg.label}
          min={incomeCfg.min}
          max={incomeCfg.max}
          step={incomeCfg.step}
          value={income}
          onChange={setIncome}
          format={fmt}
        />
        <RangeField
          id="lifestyle-rent"
          label={rentCfg.label}
          min={rentCfg.min}
          max={rentCfg.max}
          step={rentCfg.step}
          value={rent}
          onChange={setRent}
          format={fmt}
        />
        <RangeField
          id="lifestyle-groceries"
          label={col.groceries.label}
          min={col.groceries.min}
          max={col.groceries.max}
          step={col.groceries.step}
          value={groceries}
          onChange={setGroceries}
          format={fmt}
        />
        <RangeField
          id="lifestyle-transport"
          label={col.transport.label}
          min={col.transport.min}
          max={col.transport.max}
          step={col.transport.step}
          value={transport}
          onChange={setTransport}
          format={fmt}
        />
      </div>

      <div className="mt-8 space-y-3" aria-label="Spend as share of income">
        <div className="flex h-3.5 overflow-hidden rounded-full bg-brand-plum/[0.06] shadow-inner">
          {segments.map((s) => (
            <span
              key={s.key}
              className={cn(s.tone, "min-w-[3px] transition-[width] duration-300 ease-out")}
              style={{ width: `${Math.min(s.pct, 100)}%` }}
              title={`${s.label}: ${fmt(s.value)}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-plum/65">
          <span>
            <span className="font-semibold text-brand-plum/85">Fixed-ish spend:</span> {fmt(totalExp)}
          </span>
          <span className={surplus >= 0 ? "font-medium text-emerald-700" : "font-medium text-red-700"}>
            After bills: {fmt(surplus)}
          </span>
        </div>
      </div>

      {col.contextNote ? (
        <p className="mt-8 border-t border-brand-plum/10 pt-6 text-sm leading-relaxed text-brand-plum/55">{col.contextNote}</p>
      ) : null}
    </div>
  );
}

function DayInLifeBento({ items, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">Day in the life</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum">Texture of a weekday</h3>
      </div>
      <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3">
        {items.map((item, idx) => {
          const ring = accentRing[item.accent] || accentRing.admin;
          const isHero = idx === 0;
          return (
            <motion.article
              key={`${item.time}-${item.title}`}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : reduce ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: reduce ? 0 : idx * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex flex-col rounded-2xl border p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lux-lg",
                ring,
                isHero ? "md:col-span-2 md:row-span-2 md:min-h-[240px]" : "md:min-h-[112px]"
              )}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-brand-rose">{item.time}</p>
              <h4 className="mt-2 text-lg font-semibold tracking-tight text-brand-plum">{item.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-brand-plum/70">{item.body}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

function ArrivalChecklist({ block }) {
  return (
    <div className={cn(cardShell, "bg-gradient-to-b from-brand-cream/50 to-white/90 p-8")}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">Arrival checklist</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum">{block.title}</h3>
      {block.subtitle ? <p className="mt-3 text-base leading-relaxed text-brand-plum/60">{block.subtitle}</p> : null}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {block.groups.map((g) => (
          <details
            key={g.id}
            className="group rounded-2xl border border-brand-plum/[0.08] bg-white/95 p-6 shadow-sm transition-all duration-300 open:shadow-lux open:ring-1 open:ring-brand-rose/15"
          >
            <summary className="cursor-pointer list-none font-semibold tracking-tight text-brand-plum outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-brand-rose/40 focus-visible:ring-offset-2">
              <span className="flex items-center justify-between gap-3">
                {g.title}
                <span className="text-xs font-normal text-brand-rose transition-transform duration-300 group-open:rotate-180">
                  ▼
                </span>
              </span>
            </summary>
            <ol className="mt-5 space-y-4 border-t border-brand-plum/10 pt-5 text-sm leading-relaxed text-brand-plum/70">
              {g.steps.map((s) => (
                <li key={s.label}>
                  <p className="font-semibold text-brand-plum/90">{s.label}</p>
                  <p className="mt-1.5">{s.detail}</p>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </div>
  );
}

function CityVsRegional({ block }) {
  return (
    <div className={cn("overflow-hidden", cardShell)}>
      <div className="border-b border-brand-plum/10 bg-gradient-to-r from-brand-plum/[0.04] to-transparent px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">Place compare</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum">{block.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-plum/10 text-brand-plum/50">
              <th className="whitespace-nowrap px-6 py-4 font-semibold">Aspect</th>
              <th className="whitespace-nowrap px-6 py-4 font-semibold">{block.columns[0]}</th>
              <th className="whitespace-nowrap px-6 py-4 font-semibold">{block.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.aspect} className="border-b border-brand-plum/[0.06] align-top transition-colors duration-200 hover:bg-brand-plum/[0.02] last:border-0">
                <th scope="row" className="px-6 py-4 font-semibold tracking-tight text-brand-plum">
                  {row.aspect}
                </th>
                <td className="px-6 py-4 leading-relaxed text-brand-plum/70">{row.city}</td>
                <td className="px-6 py-4 leading-relaxed text-brand-plum/70">{row.regional}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlobalCompareCards({ guide }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduce = useReducedMotion();

  return (
    <section
      ref={ref}
      id="lifestyle-primer"
      className="relative overflow-hidden rounded-3xl border border-brand-plum/[0.08] bg-gradient-to-b from-white via-white to-[#fff7ef]/95 p-8 shadow-lux-lg backdrop-blur-sm md:p-10"
      aria-labelledby="lifestyle-global-heading"
    >
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-rose/[0.08] blur-3xl"
        aria-hidden
      />
      <header className="relative max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">{guide.eyebrow}</p>
        <h2 id="lifestyle-global-heading" className="text-3xl font-semibold tracking-tight text-brand-plum md:text-4xl">
          {guide.title}
        </h2>
        <p className="text-lg leading-relaxed text-brand-plum/65">{guide.lead}</p>
        <p className="text-sm leading-relaxed text-brand-plum/50">{guide.disclaimer}</p>
      </header>
      <div className="relative mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {guide.compareCards.map((card, i) => (
          <motion.div
            key={card.slug}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: reduce ? 0 : i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-2xl border border-brand-plum/[0.08] bg-white/95 p-6 shadow-lux transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-rose/25 hover:shadow-lux-lg"
          >
            <h3 className="text-xl font-semibold tracking-tight text-brand-plum">{card.name}</h3>
            <dl className="mt-5 flex flex-1 flex-col gap-5 text-sm leading-relaxed text-brand-plum/70">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-brand-rose/80">Rent feel</dt>
                <dd className="mt-1.5">{card.rentBand}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-brand-rose/80">Climate</dt>
                <dd className="mt-1.5">{card.climateVibe}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-brand-rose/80">Getting around</dt>
                <dd className="mt-1.5">{card.transport}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-brand-rose/80">Work vibe</dt>
                <dd className="mt-1.5">{card.jobFeel}</dd>
              </div>
            </dl>
            <div className="mt-8 border-t border-brand-plum/10 pt-5">
              <Link
                href={card.href}
                className="inline-flex items-center text-sm font-bold text-brand-rose underline-offset-4 transition-colors duration-300 hover:text-brand-plum hover:underline focus:outline-none focus:ring-2 focus:ring-brand-rose/40 focus:ring-offset-2"
              >
                Open {card.name} hub →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function DestinationBundle({ guide, first14, transport, jobBoard }) {
  const reduce = useReducedMotion();
  const col = guide.costOfLiving;

  return (
    <div className="space-y-10">
      <section
        id="lifestyle-primer"
        className="relative overflow-hidden rounded-3xl border border-brand-plum/[0.08] bg-gradient-to-b from-white via-white to-[#fff9f4]/95 p-8 shadow-lux-lg backdrop-blur-sm md:p-10"
        aria-labelledby="lifestyle-destination-heading"
      >
        <div
          className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/4 rounded-full bg-[#caa64d]/[0.09] blur-3xl"
          aria-hidden
        />
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-3xl space-y-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">{guide.eyebrow}</p>
          <h2 id="lifestyle-destination-heading" className="text-3xl font-semibold tracking-tight text-brand-plum md:text-4xl">
            {guide.title}
          </h2>
          <p className="text-lg leading-relaxed text-brand-plum/65">{guide.lead}</p>
          <p className="text-sm leading-relaxed text-brand-plum/50">{guide.disclaimer}</p>
        </motion.header>
      </section>

      {first14 ? <First14DaysTimeline data={first14} /> : null}

      {col ? <CostOfLivingCalculator col={col} /> : null}

      {transport ? <TransportMoveStrip data={transport} /> : null}

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <DayInLifeBento items={guide.dayInLife} reduce={reduce} />
        <div className="flex flex-col gap-10">
          {guide.arrivalChecklist ? <ArrivalChecklist block={guide.arrivalChecklist} /> : null}
        </div>
      </div>

      {jobBoard ? <StudentJobBoardAu data={jobBoard} /> : null}

      {guide.cityVsRegional ? <CityVsRegional block={guide.cityVsRegional} /> : null}
    </div>
  );
}

/**
 * Lifestyle orientation: `guide` from `data/lifestyle-guides.json`;
 * `first14`, `transport`, `jobBoard` from `lib/experience-data`.
 */
export function LifestyleExperienceBlock({ guide, first14 = null, transport = null, jobBoard = null }) {
  if (!guide) return null;
  if (guide.compareCards?.length) {
    return (
      <div className="space-y-10">
        <GlobalCompareCards guide={guide} />
        {transport ? <TransportMoveStrip data={transport} /> : null}
      </div>
    );
  }
  return <DestinationBundle guide={guide} first14={first14} transport={transport} jobBoard={jobBoard} />;
}
