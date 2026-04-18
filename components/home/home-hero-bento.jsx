"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Bento-style hero: light MinRosh surfaces with one deep plum accent card for contrast.
 */
export function HomeHeroBento({ siteData, trustNote }) {
  const reduceMotion = useReducedMotion();
  const heroProofItems = [
    "Registered guidance",
    "4 destination pathways",
    "Structured next steps",
  ];

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: easeOut, delay },
        };

  return (
    <section
      className="relative overflow-hidden border-b border-brand-plum/10 bg-gradient-to-b from-brand-cream via-white to-zinc-50 px-4 py-6 sm:px-6 md:py-8"
      aria-labelledby="home-hero-heading"
    >
      {/* Premium mesh: brand warmth + subtle indigo depth (light theme) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-20%,rgba(155,74,108,0.14),transparent_50%),radial-gradient(ellipse_100%_70%_at_100%_0%,rgba(79,70,229,0.12),transparent_45%),radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(202,166,77,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(17,24,39,0)_0%,rgba(17,24,39,0.06)_45%,rgba(17,24,39,0)_78%)]"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
        <motion.div className="flex flex-col gap-3 lg:col-span-6" {...fadeUp(0)}>
          <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-brand-plum/10 backdrop-blur-xl sm:p-6 md:p-7">
            <p className="mb-2 inline-flex items-center rounded-full border border-brand-rose/25 bg-brand-rose/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-rose">
              {siteData.hero.eyebrow}
            </p>
            <h1
              id="home-hero-heading"
              className="text-balance text-[1.65rem] font-extrabold leading-[1.12] tracking-tight text-brand-plum sm:text-4xl lg:text-[2.8rem]"
            >
              {siteData.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-brand-plum/80 sm:text-lg">
              {siteData.hero.description}
            </p>

            <div className="sticky bottom-3 z-10 mt-6 flex flex-col gap-3 rounded-2xl bg-white/95 p-2 shadow-lg shadow-brand-plum/10 backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0 sm:flex-row sm:flex-wrap">
              <Link
                href="/#quiz"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-center text-sm font-semibold text-white no-underline shadow-md shadow-orange-500/20 outline-none ring-offset-2 ring-offset-white transition hover:scale-[1.01] hover:bg-orange-400 hover:no-underline focus-visible:ring-2 focus-visible:ring-orange-300 sm:w-auto sm:min-w-[200px]"
              >
                {siteData.hero.primaryCta}
              </Link>
              <Link
                href="/book-consultation"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-brand-rose/35 bg-white px-6 py-3.5 text-center text-sm font-semibold text-brand-plum no-underline shadow-sm outline-none ring-offset-2 ring-offset-white transition hover:scale-[1.01] hover:bg-brand-cream hover:no-underline focus-visible:ring-2 focus-visible:ring-brand-rose/50 sm:w-auto"
              >
                {siteData.hero.secondaryCta}
              </Link>
            </div>

            <ul className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-brand-plum/75" aria-label="Why choose MinRosh">
              {heroProofItems.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-plum/10 bg-brand-cream/60 px-3 py-1.5"
                >
                  <span className="text-brand-rose" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 border-l-[3px] border-brand-rose/35 pl-3 text-sm leading-relaxed text-brand-plum/70">
              {trustNote}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {siteData.stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-brand-plum/10 bg-white/90 p-4 shadow-md shadow-brand-plum/5 outline-none backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:border-brand-gold/40 hover:shadow-lg focus-within:ring-2 focus-within:ring-brand-rose/40"
                aria-label={`${stat.label}: ${stat.value}`}
              >
                <p className="text-base font-bold tracking-tight text-brand-plum">{stat.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-brand-plum/65">{stat.label}</p>
              </article>
            ))}
          </div>
        </motion.div>

        <motion.div className="grid gap-4 lg:col-span-6 lg:grid-rows-[minmax(0,1fr)_auto]" {...fadeUp(0.08)}>
          <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-brand-plum/10 bg-zinc-100 shadow-2xl shadow-brand-plum/15 sm:min-h-[300px] lg:min-h-[320px]">
            <Image
              src="/images/hero-sydney-real.jpg"
              alt="Sydney Harbour — Australian migration journeys"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-plum/25 via-transparent to-transparent" aria-hidden />
          </div>
          <div className="rounded-3xl border border-brand-plum/20 bg-brand-plum p-5 text-brand-cream shadow-lg sm:p-6">
            <p className="text-sm font-semibold text-brand-gold">Clarity-first visa planning</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-cream/90">
              Structured eligibility reviews, document-ready coaching, and lodgement support — built for confidence and momentum.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
