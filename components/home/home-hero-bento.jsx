"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Focus-first hero: deep brand canvas, one headline, one primary CTA.
 * Stats and proof chips live in {@link TrustProofStrip}.
 */
export function HomeHeroBento({ siteData }) {
  const reduceMotion = useReducedMotion();
  const lead = siteData.hero.lead ?? siteData.hero.description ?? "";
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 90]);

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
      className="relative isolate h-[90vh] min-h-[560px] overflow-hidden border-b border-white/10 bg-brand-plum"
      aria-labelledby="home-hero-heading"
    >
      <motion.div className="absolute inset-0" style={{ y: parallaxY }}>
        <Image
          src="/images/brisbane-riverwalk.png"
          alt="Brisbane riverwalk and city skyline"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Strong plum wash for WCAG-friendly white type */}
      <div className="pointer-events-none absolute inset-0 bg-brand-plum/90" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-plum/80 via-transparent to-brand-plum/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_72%)]"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 md:justify-center md:pb-8 lg:max-w-3xl lg:px-0 lg:pb-10">
        <motion.div {...fadeUp(0)}>
          <p className="mb-4 inline-flex items-center rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-cream">
            {siteData.hero.eyebrow}
          </p>
          <h1
            id="home-hero-heading"
            className="text-balance text-[2.1rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[2.6rem] md:text-[2.85rem] lg:text-[3.25rem]"
          >
            {siteData.hero.title}
          </h1>
          {lead ? (
            <p className="mt-6 max-w-2xl text-pretty text-sm font-normal leading-relaxed text-white/80 sm:text-base">
              {lead}
            </p>
          ) : null}

          <div className="mt-10">
            <Link
              href="/#quiz"
              className="home-hero-primary-cta inline-flex min-h-[52px] w-full items-center justify-center rounded-xl px-8 py-4 text-center text-base font-bold no-underline outline-none ring-offset-2 ring-offset-brand-plum transition hover:no-underline focus-visible:ring-2 focus-visible:ring-orange-400 sm:w-auto sm:min-w-[240px]"
            >
              Start Free Assessment
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
