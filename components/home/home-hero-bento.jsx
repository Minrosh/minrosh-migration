"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HomeEligibilityWizard } from "./home-eligibility-wizard";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Homepage hero: full-bleed destination photography with a calm, premium overlay,
 * serif headline rhythm, and a clear primary/secondary CTA pair (reference landing feel).
 */
export function HomeHeroBento({ siteData, trustNote }) {
  const reduceMotion = useReducedMotion();
  const heroProofItems = [
    "Registered guidance",
    "4 destination pathways",
    "Structured next steps",
  ];
  const trustLine = "Trusted by applicants across Australia and overseas • Private & secure • Brisbane-based support";

  const lead = siteData.hero.lead ?? siteData.hero.description ?? "";
  const bullets = Array.isArray(siteData.hero.bullets) ? siteData.hero.bullets : null;

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: easeOut, delay },
        };

  return (
    <section className="home-hero-landing relative overflow-hidden" aria-labelledby="home-hero-heading">
      <div className="relative min-h-[min(92vh,920px)] w-full">
        <Image
          src="/images/hero-sydney-real.jpg"
          alt="Sydney Harbour — Australian migration journeys"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-plum/78 via-brand-plum/55 to-brand-plum/35" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_20%_10%,rgba(255,255,255,0.18),transparent_55%)]" aria-hidden />

        <div className="relative z-[1] mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-[calc(var(--site-header-chrome-height)+28px)] sm:px-6 sm:pb-12 sm:pt-[calc(var(--site-header-chrome-height)+40px)] md:min-h-[min(88vh,900px)] md:justify-center md:pb-14 md:pt-[calc(var(--site-header-chrome-height)+52px)]">
          <motion.div className="max-w-3xl" {...fadeUp(0)}>
            <p className="home-hero-landing__eyebrow mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-md">
              {siteData.hero.eyebrow}
            </p>
            <h1
              id="home-hero-heading"
              className="home-hero-landing__title text-balance text-[2.05rem] leading-[1.08] text-white sm:text-[2.55rem] md:text-5xl lg:text-[3.25rem]"
            >
              {siteData.hero.title}
            </h1>
            {lead ? (
              <p className="mt-5 max-w-2xl text-pretty text-base font-medium leading-relaxed text-white/90 sm:text-lg">
                {lead}
              </p>
            ) : null}
            {bullets?.length ? (
              <ul className="mt-5 max-w-2xl list-disc space-y-2.5 pl-5 text-base leading-relaxed text-white/85 sm:text-[1.05rem]">
                {bullets.map((item) => (
                  <li key={item} className="pl-0.5 marker:text-white/55">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/#quiz"
                className="home-hero-primary-cta inline-flex min-h-[52px] w-full items-center justify-center rounded-lg px-8 py-4 text-center text-base font-bold no-underline outline-none ring-offset-2 ring-offset-brand-plum transition hover:no-underline focus-visible:ring-2 focus-visible:ring-orange-300 sm:w-auto sm:min-w-[240px]"
              >
                Start Free Assessment
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg border border-white/35 bg-white/5 px-8 py-4 text-center text-base font-semibold text-white no-underline backdrop-blur-md transition hover:bg-white/10 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-auto sm:min-w-[200px]"
              >
                How it works
              </Link>
            </div>

            <p className="mt-4 text-sm text-white/80">
              <span className="mr-1.5 font-semibold text-white/90">Prefer a conversation first?</span>
              <Link
                href="/book-consultation"
                className="font-semibold text-white underline decoration-white/35 underline-offset-4 transition hover:text-white hover:decoration-white/70"
              >
                {siteData.hero.secondaryCta}
              </Link>
            </p>

            <p className="home-trust-line mt-6 text-white/75">{trustLine}</p>

            <ul className="mt-6 flex flex-wrap gap-2.5 text-sm font-semibold text-white/85" aria-label="Why choose MinRosh">
              {heroProofItems.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/10 px-3.5 py-2 backdrop-blur-md"
                >
                  <span className="text-[color:var(--landing-accent)]" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 max-w-2xl border-l-[3px] border-white/35 pl-4 text-base leading-relaxed text-white/80">
              {trustNote}
            </p>
          </motion.div>

          <motion.div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4" {...fadeUp(0.08)}>
            {siteData.stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-white/18 bg-white/10 p-5 text-white shadow-lg shadow-black/20 outline-none backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/14 focus-within:ring-2 focus-within:ring-white/40"
                aria-label={`${stat.label}: ${stat.value}`}
              >
                <p className="text-lg font-bold tracking-tight text-white">{stat.value}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{stat.label}</p>
              </article>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="home-hero-eligibility-anchor">
        <HomeEligibilityWizard />
      </div>
    </section>
  );
}
