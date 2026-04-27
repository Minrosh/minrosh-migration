"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

/**
 * @param {{ data: { eyebrow?: string; title: string; lead?: string; disclaimer?: string; filters: string[]; listings: Array<{ id: string; title: string; employer: string; tags: string[]; hoursPerWeek: string; payBand: string; detail: string }>; sanityMeter: { title: string; workLabel: string; studyLabel: string; workDefault: number; studyDefault: number; workMax: number; studyMax: number; zones: Array<{ maxScore: number; label: string; tone: string; hint: string }> } } | null }} props
 */
export function StudentJobBoardAu({ data }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState("All");
  const [workH, setWorkH] = useState(data?.sanityMeter?.workDefault ?? 14);
  const [studyH, setStudyH] = useState(data?.sanityMeter?.studyDefault ?? 32);

  const meter = data?.sanityMeter;

  const filtered = useMemo(() => {
    const listings = data?.listings ?? [];
    if (filter === "All") return listings;
    return listings.filter((l) => l.tags.some((t) => t.toLowerCase() === filter.toLowerCase()));
  }, [data?.listings, filter]);

  const score = workH + studyH;
  const zone =
    meter?.zones?.find((z) => score <= z.maxScore) ?? meter?.zones?.[meter.zones.length - 1] ?? null;

  const zoneClass =
    zone?.tone === "emerald"
      ? "border-emerald-200/80 bg-emerald-50/70 text-emerald-900"
      : zone?.tone === "amber"
        ? "border-amber-200/80 bg-amber-50/80 text-amber-950"
        : "border-rose-200/80 bg-rose-50/80 text-rose-950";

  if (!data) return null;

  return (
    <section
      ref={ref}
      id="student-job-board-au"
      className="rounded-3xl border border-brand-plum/[0.08] bg-white/90 p-8 shadow-[0_8px_40px_rgba(61,36,50,0.07)] backdrop-blur-md"
      aria-labelledby="job-board-heading"
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-rose/90">{data.eyebrow}</p>
        <h3 id="job-board-heading" className="text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
          {data.title}
        </h3>
        {data.lead ? <p className="text-base leading-relaxed text-brand-plum/65">{data.lead}</p> : null}
        {data.disclaimer ? <p className="text-xs leading-relaxed text-brand-plum/50">{data.disclaimer}</p> : null}
      </div>

      {meter ? (
        <div className="mt-10 rounded-2xl border border-brand-plum/[0.08] bg-gradient-to-br from-[#fdf8fc] to-white p-8 shadow-inner">
          <h4 className="text-lg font-semibold tracking-tight text-brand-plum">{meter.title}</h4>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-brand-plum/80" htmlFor="sanity-work">
                {meter.workLabel}
              </label>
              <input
                id="sanity-work"
                type="range"
                min={0}
                max={meter.workMax}
                value={workH}
                onChange={(e) => setWorkH(Number(e.target.value))}
                className="mt-3 w-full accent-[#9b4a6c]"
              />
              <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-rose">{workH}h</p>
            </div>
            <div>
              <label className="text-sm font-medium text-brand-plum/80" htmlFor="sanity-study">
                {meter.studyLabel}
              </label>
              <input
                id="sanity-study"
                type="range"
                min={0}
                max={meter.studyMax}
                value={studyH}
                onChange={(e) => setStudyH(Number(e.target.value))}
                className="mt-3 w-full accent-[#9b4a6c]"
              />
              <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-rose">{studyH}h</p>
            </div>
          </div>
          <div
            className={cn(
              "mt-8 rounded-2xl border p-6 transition-all duration-300",
              zoneClass
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Combined load</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{score}h</p>
            {zone ? (
              <>
                <p className="mt-3 text-lg font-semibold">{zone.label}</p>
                <p className="mt-2 text-sm leading-relaxed opacity-85">{zone.hint}</p>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {data.filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-rose/40 focus:ring-offset-2",
              filter === f
                ? "border-brand-rose bg-brand-rose text-white shadow-md"
                : "border-brand-plum/12 bg-white/80 text-brand-plum/75 hover:-translate-y-0.5 hover:border-brand-rose/30 hover:shadow-md"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {filtered.map((job, i) => (
          <motion.li
            key={job.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: reduce ? 0 : i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <article
              className={cn(
                "flex h-full flex-col rounded-2xl border border-brand-plum/[0.08] bg-white/95 p-6 shadow-[0_6px_24px_rgba(61,36,50,0.05)] transition-all duration-300",
                "hover:-translate-y-1 hover:border-brand-rose/20 hover:shadow-xl"
              )}
            >
              <div className="flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-brand-plum/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-plum/55"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h4 className="mt-4 text-lg font-semibold tracking-tight text-brand-plum">{job.title}</h4>
              <p className="mt-1 text-sm text-brand-plum/50">{job.employer}</p>
              <dl className="mt-4 grid gap-2 text-sm text-brand-plum/70">
                <div className="flex justify-between gap-4 border-t border-brand-plum/10 pt-4">
                  <dt className="text-brand-plum/45">Hours</dt>
                  <dd className="font-medium text-brand-plum">{job.hoursPerWeek}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-plum/45">Pay (illustrative)</dt>
                  <dd className="text-right font-medium text-brand-plum">{job.payBand}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-brand-plum/65">{job.detail}</p>
            </article>
          </motion.li>
        ))}
      </ul>

      {!filtered.length ? (
        <p className="mt-6 text-sm text-brand-plum/55">No sample roles in this filter—try All.</p>
      ) : null}
    </section>
  );
}
