"use client";

import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "./ui/motion-wrapper";

const TILES = [
  {
    title: "Student visas",
    body: "Course fit, genuine student factors and document preparation—with realistic sequencing, not outcome promises.",
    href: "/student-visa-australia",
    cta: "Student visa hub",
    tone: "cream",
  },
  {
    title: "Education consultation",
    body: "Planning study and timing alongside migration considerations, aligned to official programme rules.",
    href: "/education-consultation",
    cta: "Education consultation",
    tone: "gold",
  },
  {
    title: "Skilled migration",
    body: "Points-tested pathways discussed against current policy lists—indicative until formally assessed.",
    href: "/skilled-migration",
    cta: "Skilled migration hub",
    tone: "rose",
  },
  {
    title: "Partner & family pathways",
    body: "Relationship evidence, consistency and lodgement sequencing for partner and family-style routes.",
    href: "/partner-visa-australia",
    cta: "Partner & family hub",
    tone: "cream",
  },
  {
    title: "Employer-sponsored options",
    body: "Sponsorship and nomination pathways where employer-backed routes fit your brief and timeline.",
    href: "/employer-sponsored-visas",
    cta: "Employer-sponsored visas",
    tone: "plum",
  },
  {
    title: "Visitor visas",
    body: "Short stays with clear travel purpose and document readiness—reducing common refusal risks where possible.",
    href: "/visitor-visas",
    cta: "Visitor visas",
    tone: "white",
  },
];

function tileClasses(tone) {
  switch (tone) {
    case "gold":
      return "glass-card border border-brand-gold/25 bg-brand-gold/10 text-brand-plum";
    case "rose":
      return "glass-card border border-brand-rose/25 bg-brand-rose/10 text-brand-plum";
    case "plum":
      return "glass-card border border-white/15 bg-brand-plum text-white";
    case "white":
      return "glass-card border border-brand-plum/10 bg-white text-brand-plum";
    default:
      return "glass-card border border-brand-cream/80 bg-brand-cream/50 text-brand-plum";
  }
}

function linkClasses(tone) {
  return tone === "plum"
    ? "font-black text-brand-gold underline decoration-2 underline-offset-8"
    : "font-black text-brand-rose underline decoration-2 underline-offset-8";
}

export function HomeServicesPathways() {
  return (
    <section className="home-section bg-white" aria-labelledby="home-services-heading">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionReveal y={16}>
          <h2
            id="home-services-heading"
            className="text-center text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl"
          >
            Pathways we guide most often
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
            Registered migration guidance led from Brisbane, with online consultations for clients worldwide. We cite
            official sources and highlight what departments publish—not forum summaries alone.
          </p>
        </MotionReveal>

        <MotionStagger className="mt-10 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile, i) => (
            <MotionItem key={tile.href}>
              <div className={`relative flex h-full flex-col overflow-hidden p-6 sm:p-8 ${tileClasses(tile.tone)}`}>
                <span
                  className={`absolute right-4 top-4 text-5xl font-black leading-none opacity-[0.08] ${tile.tone === "plum" ? "text-white" : "text-brand-plum"}`}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={`text-xl font-black ${tile.tone === "plum" ? "text-white" : "text-brand-plum"} sm:text-2xl`}>
                  {tile.title}
                </h3>
                <p
                  className={`mt-3 flex-1 text-sm font-medium leading-relaxed sm:text-base ${tile.tone === "plum" ? "text-brand-cream/75" : "text-brand-plum/65"}`}
                >
                  {tile.body}
                </p>
                <Link
                  href={tile.href}
                  className={`mt-6 inline-flex min-h-[48px] touch-manipulation items-center gap-2 transition-all hover:gap-3 ${linkClasses(tile.tone)}`}
                >
                  {tile.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
