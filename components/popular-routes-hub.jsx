"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PublicFileImg } from "./public-file-img";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Australia", value: "australia" },
  { label: "UK", value: "uk" },
  { label: "New Zealand", value: "nz" },
  { label: "Canada", value: "canada" },
];

/**
 * @param {{ routes: Array<{ id: string; title: string; excerpt: string; href: string; image: string; regions: string[] }> }} props
 */
export function PopularRoutesHub({ routes }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return routes;
    return routes.filter((r) => Array.isArray(r.regions) && r.regions.includes(filter));
  }, [filter, routes]);

  return (
    <div className="popular-routes-hub mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="popular-routes-hub__intro mb-10 text-center sm:mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-rose">Popular routes</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-plum sm:text-4xl md:text-[2.35rem]">
          Pathways clients compare most often
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
          Filter by destination, then open a hub for sequencing, official-source habits, and clear next steps. Always
          confirm eligibility on the relevant government site before you lodge.
        </p>
      </header>

      <div className="popular-routes-hub__filters mb-8 flex flex-wrap justify-center gap-2 sm:gap-3" role="toolbar" aria-label="Filter routes by destination">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`min-h-[44px] rounded-full border px-4 text-[11px] font-black uppercase tracking-wider transition-all sm:px-5 ${
              filter === f.value
                ? "border-[#881337] bg-gradient-to-br from-[#881337] to-brand-plum text-white shadow-md"
                : "border-brand-plum/15 bg-white text-brand-plum/70 hover:border-[#881337]/35 hover:text-brand-plum"
            }`}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="m-0 flex list-none flex-col gap-4 p-0 sm:gap-5">
        {filtered.map((item) => (
          <li key={item.id}>
            <article className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-brand-plum/10 bg-white shadow-sm transition-all duration-300 hover:border-[#881337]/22 hover:shadow-md sm:flex-row sm:items-stretch">
              <Link
                href={item.href}
                className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-[min(38%,280px)]"
              >
                <PublicFileImg
                  src={item.image}
                  alt=""
                  width={560}
                  height={360}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, 280px"
                />
                <span className="sr-only">{item.title}</span>
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-7">
                <h2 className="text-xl font-black tracking-tight text-brand-plum sm:text-2xl">
                  <Link href={item.href} className="text-brand-plum transition-colors hover:text-[#881337]">
                    {item.title}
                  </Link>
                </h2>
                <p className="text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">{item.excerpt}</p>
                <div>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm font-black text-[#881337] underline decoration-2 underline-offset-8 transition-all hover:gap-3"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm font-medium text-brand-plum/70" role="status">
          No routes match this filter. Choose <strong>All</strong> to see every pathway.
        </p>
      ) : null}

      <section
        className="popular-routes-hub__cta mt-12 rounded-[2rem] border border-[#881337]/15 bg-gradient-to-br from-brand-cream via-[#fff7f9] to-brand-cream px-6 py-10 text-center shadow-inner sm:px-10 sm:py-12"
        aria-labelledby="popular-routes-cta-heading"
      >
        <h2 id="popular-routes-cta-heading" className="text-xl font-black tracking-tight text-brand-plum sm:text-2xl">
          Not sure which route fits you?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-brand-plum/70 sm:text-base">
          Start with the free Smart Navigator assessment — a few structured questions, then a practical next-step
          suggestion. It does not replace official eligibility decisions.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/assessment"
            className="btn btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-8 transition-transform hover:-translate-y-0.5"
          >
            Check eligibility
          </Link>
          <Link
            href="/#popular-routes"
            className="btn btn-ghost inline-flex min-h-[48px] items-center justify-center rounded-full px-6"
          >
            Homepage pathway tiles
          </Link>
        </div>
      </section>
    </div>
  );
}
