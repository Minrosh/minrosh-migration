"use client";

import Link from "next/link";

const TILES = [
  {
    title: "Skilled Migration",
    body: "Points-tested pathways discussed against current policy lists—indicative planning until formally assessed.",
    href: "/skilled-migration",
    cta: "Skilled migration hub",
    tone: "rose",
  },
  {
    title: "Student Visa & Education Consultation",
    body: "Course fit, genuine student factors and document preparation—with realistic sequencing, not outcome promises.",
    href: "/student-visa-australia",
    cta: "Student visa hub",
    tone: "cream",
  },
  {
    title: "Partner & Family Visas",
    body: "Relationship evidence, consistency and lodgement sequencing for partner and family-style routes.",
    href: "/partner-visa-australia",
    cta: "Partner & family hub",
    tone: "gold",
  },
  {
    title: "Employer Sponsorship",
    body: "Sponsorship and nomination pathways where employer-backed routes fit your brief and timeline.",
    href: "/employer-sponsored-visas",
    cta: "Employer-sponsored visas",
    tone: "burgundyOutline",
  },
  {
    title: "Visitor Visas",
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
    case "burgundyOutline":
      return "glass-card border-2 border-[#881337]/22 bg-white text-brand-plum shadow-sm";
    case "white":
      return "glass-card border border-brand-plum/10 bg-white text-brand-plum";
    default:
      return "glass-card border border-brand-cream/80 bg-brand-cream/50 text-brand-plum";
  }
}

function linkClasses(tone) {
  return tone === "burgundyOutline"
    ? "font-black text-[#881337] underline decoration-2 underline-offset-8 hover:text-brand-plum"
    : "font-black text-brand-rose underline decoration-2 underline-offset-8";
}

export function HomeServicesPathways() {
  return (
    <section className="home-section scroll-mt-[calc(var(--site-header-chrome-height,var(--header-height,88px))+16px)]" aria-labelledby="home-services-heading" id="popular-routes">
      <div className="relative isolate mx-auto w-full min-w-0 overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-gradient-to-b from-white via-[#FBF6F4]/45 to-white p-5 shadow-[var(--shadow-lux)] sm:p-7">
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
          aria-hidden
          style={{
            background:
              "radial-gradient(130% 100% at 50% 0%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 62%), radial-gradient(120% 100% at 50% 100%, rgba(136,19,55,0.05) 0%, rgba(136,19,55,0) 65%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full min-w-0">
        <div>
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
        </div>

        <ul className="mt-8 grid min-w-0 list-none grid-cols-1 gap-[clamp(24px,4vw,48px)] pl-0 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile, i) => (
            <li key={tile.href} className="min-w-0">
              <div className={`relative flex h-full min-h-full flex-col overflow-hidden rounded-2xl p-5 sm:p-8 ${tileClasses(tile.tone)}`}>
                <span
                  className={`absolute right-3 top-3 text-5xl font-black leading-none opacity-[0.08] sm:right-4 sm:top-4 ${tile.tone === "burgundyOutline" ? "text-[#881337]" : "text-brand-plum"}`}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="text-lg font-black text-brand-plum sm:text-xl md:text-2xl"
                >
                  {tile.title}
                </h3>
                <p
                  className="mt-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65 sm:text-base"
                >
                  {tile.body}
                </p>
                <Link
                  href={tile.href}
                  className={`mt-5 inline-flex min-h-[48px] touch-manipulation items-center gap-2 transition-all hover:gap-3 sm:mt-6 ${linkClasses(tile.tone)}`}
                >
                  {tile.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}
