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

  const lead = siteData.hero.lead ?? siteData.hero.description ?? "";
  const bullets = Array.isArray(siteData.hero.bullets) ? siteData.hero.bullets : null;

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
                className="home-hero-primary-cta inline-flex min-h-[52px] w-full items-center justify-center rounded-xl px-8 py-4 text-center text-base font-bold no-underline outline-none ring-offset-2 ring-offset-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:no-underline focus-visible:ring-2 focus-visible:ring-brand-rose/60 focus-visible:ring-offset-2 sm:w-auto sm:min-w-[240px]"
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
          <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-brand-plum/10 bg-zinc-100 shadow-lux-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(61,36,50,0.14)] sm:min-h-[300px] lg:min-h-[340px]">
            <motion.div
              className="absolute inset-0"
              animate={reduceMotion ? undefined : { scale: [1.02, 1.08, 1.02], x: [0, -8, 0] }}
              transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/hero-sydney-real.jpg"
                alt="Sydney Harbour — Australian migration journeys"
                fill
                priority
                quality={92}
                sizes="(max-width: 1024px) 96vw, (max-width: 1536px) 50vw, 720px"
                className="object-cover object-center"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-plum/25 via-transparent to-transparent" aria-hidden />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
