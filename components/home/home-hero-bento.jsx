"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import commandSignals from "../../data/home-hero-command-signals.json";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Bento-style hero: light MinRosh surfaces with one deep plum accent card for contrast.
 */
export function HomeHeroBento({ siteData, trustNote }) {
  const reduceMotion = useReducedMotion();

  const lead = siteData.hero.lead ?? siteData.hero.description ?? "";
  const bullets = Array.isArray(siteData.hero.bullets) ? siteData.hero.bullets : null;
  const commandMetrics = Array.isArray(commandSignals?.metrics) ? commandSignals.metrics : [];
  const microProof = Array.isArray(commandSignals?.microProof) ? commandSignals.microProof : [];
  const readinessMetric = commandMetrics.find((item) => item.id === "readiness") || commandMetrics[2] || null;

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
      className="relative overflow-hidden border-b border-brand-plum/10 bg-gradient-to-b from-brand-cream via-white to-zinc-50 px-4 py-10 sm:px-6 md:py-14 lg:py-16"
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

      <div className="relative z-[1] mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
        <motion.div className="flex flex-col gap-6 lg:col-span-6" {...fadeUp(0)}>
          <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lux-lg backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(61,36,50,0.12)] sm:p-8 md:p-10">
            <p className="mb-3 inline-flex items-center rounded-full border border-brand-rose/25 bg-brand-rose/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-rose">
              {siteData.hero.eyebrow}
            </p>
            <h1
              id="home-hero-heading"
              className="text-balance text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-brand-plum sm:text-[2.35rem] md:text-5xl lg:text-[3.05rem]"
            >
              {siteData.hero.title}
            </h1>
            {lead ? (
              <p className="mt-6 max-w-xl text-pretty text-base font-medium leading-relaxed text-brand-plum/70 sm:text-lg">
                {lead}
              </p>
            ) : null}
            {bullets?.length ? (
              <ul className="mt-4 max-w-xl list-disc space-y-2.5 pl-5 text-base leading-relaxed text-brand-plum/80 sm:text-[1.05rem]">
                {bullets.map((item) => (
                  <li key={item} className="pl-0.5">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="sticky bottom-3 z-10 mt-6 flex flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-lg shadow-brand-plum/10 backdrop-blur sm:static sm:mt-8 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
              <Link
                href="/#quiz"
                className="home-hero-primary-cta inline-flex min-h-[52px] w-full items-center justify-center rounded-xl px-8 py-4 text-center text-base font-bold text-white visited:text-white hover:text-white focus-visible:text-white no-underline outline-none ring-offset-2 ring-offset-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:no-underline focus-visible:ring-2 focus-visible:ring-brand-rose/60 focus-visible:ring-offset-2 sm:w-auto sm:min-w-[240px]"
              >
                {siteData.hero.primaryCta}
              </Link>
              <p className="text-center text-sm text-brand-plum/70 sm:text-left">
                <span className="mr-1.5 font-medium text-brand-plum/80">Next step:</span>
                <Link
                  href="/book-consultation"
                  className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4 transition hover:text-brand-plum hover:decoration-brand-plum/40"
                >
                  {siteData.hero.secondaryCta}
                </Link>
                <span className="mx-2 text-brand-plum/35" aria-hidden>
                  ·
                </span>
                <Link
                  href="/assessment"
                  className="font-semibold text-brand-rose underline decoration-brand-rose/40 underline-offset-4 transition hover:text-brand-plum hover:decoration-brand-plum/40"
                >
                  Free assessment
                </Link>
              </p>
            </div>

            <p className="mt-6 border-l-[3px] border-brand-rose/35 pl-4 text-base leading-relaxed text-brand-plum/70">
              {trustNote}
            </p>
          </div>
        </motion.div>

        <motion.div className="grid gap-6 lg:col-span-6 lg:grid-rows-[minmax(0,1fr)_auto]" {...fadeUp(0.08)}>
          <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-brand-plum/10 bg-brand-cream/70 shadow-lux-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(61,36,50,0.14)] sm:min-h-[300px] lg:min-h-[340px]">
            <motion.div
              className="absolute inset-0"
              animate={reduceMotion ? undefined : { scale: [1.02, 1.08, 1.02], x: [0, -8, 0] }}
              transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/hero-brisbane-river-cbd-hd.jpg"
                alt="Brisbane River and CBD skyline — Australian migration journeys"
                fill
                priority
                quality={92}
                sizes="(max-width: 1024px) 96vw, (max-width: 1536px) 50vw, 720px"
                className="object-cover object-center"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-plum/25 via-transparent to-transparent" aria-hidden />
            <div className="absolute inset-x-3 bottom-3 z-[1] rounded-2xl border border-white/30 bg-white/18 p-3 text-white shadow-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Migration command deck</p>
              {commandMetrics.length ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {commandMetrics.map((metric) => (
                    <div key={metric.id} className="rounded-xl border border-white/20 bg-black/15 px-2 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/70">{metric.label}</p>
                      <p className="mt-0.5 text-sm font-bold">{metric.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-gold via-[#ffd88a] to-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${Number(readinessMetric?.progress || 68)}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-white/85">
                Endowed progress: you begin with {readinessMetric?.value || "68%"} readiness by completing the first guided step.
              </p>
              {microProof.length ? (
                <ul className="mt-2 space-y-1 text-[11px] text-white/80">
                  {microProof.map((line) => (
                    <li key={line} className="flex gap-1.5">
                      <span className="mt-1 inline-block h-1 w-1 rounded-full bg-white/80" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/#quiz"
              className="rounded-2xl border border-brand-plum/10 bg-white/90 px-4 py-3 text-sm font-semibold text-brand-plum shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Start with Quiz
            </Link>
            <Link
              href="/#pathways"
              className="rounded-2xl border border-brand-plum/10 bg-white/90 px-4 py-3 text-sm font-semibold text-brand-plum shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Explore Pathways
            </Link>
            <Link
              href="/book-consultation"
              className="rounded-2xl border border-brand-rose/20 bg-brand-rose/10 px-4 py-3 text-sm font-semibold text-brand-rose shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Reserve Strategy Call
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
