"use client";

import Image from "next/image";
import { HERO_BRISBANE_BLUR_DATA_URL } from "@/lib/marketing/hero-brisbane-blur";
import { TrackedAnchor, TrackedLink } from "../tracked-link";

/** LCP hero: Brisbane River, CBD skyline, CityCat (see `/public/images/hero-brisbane-river-cbd-hd.jpg`). */
const HERO_BRISBANE_IMAGE = {
  src: "/images/hero-brisbane-river-cbd-hd.jpg",
  alt: "Brisbane River and CBD skyline at dusk with a CityCat ferry on the water",
};

const plumDark = "#1F1020";
const plumMid = "#8B1D41";
const charcoal = "#1F1020";
const iconSoft = "#F5EAF0";

function IconLocationPin({ className = "h-5 w-5", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function IconBriefcase({ className = "h-[22px] w-[22px]", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="8" width="14" height="11" rx="2" stroke={stroke} strokeWidth="2" />
      <path d="M9 8V7a2 2 0 012-2h2a2 2 0 012 2v1" stroke={stroke} strokeWidth="2" />
      <path d="M12 12v3" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconShieldCheck({ className = "h-[22px] w-[22px]", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s8-4 8-10V6l-8-3-8 3v5c0 6 8 10 8 10z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 12l2 2 4-4" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe({ className = "h-5 w-5", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="2" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function IconPeople({ className = "h-5 w-5", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke={stroke} strokeWidth="2" />
      <circle cx="17" cy="9" r="2.5" stroke={stroke} strokeWidth="2" />
      <path
        d="M4 20v-1a4 4 0 014-4h2a4 4 0 014 4v1M14 20v-1a3 3 0 013-3"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrustedBadge({ className = "h-5 w-5", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="11" r="6" stroke={stroke} strokeWidth="2" />
      <path d="M12 17v4M9 21h6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9v2.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const FEATURES = [
  {
    title: "Expert support",
    text: "Employer sponsorship and education consultation",
    Icon: IconBriefcase,
  },
  {
    title: "Plain-English guidance",
    text: "Honest advice and ongoing support before you spend money",
    Icon: IconShieldCheck,
  },
];

const TRUST_PILLARS = [
  {
    title: "Brisbane-based",
    body: "Local experts with a global outlook",
    Icon: IconLocationPin,
  },
  {
    title: "Global reach",
    body: "Australia, Canada, the UK & NZ",
    Icon: IconGlobe,
  },
  {
    title: "All pathways",
    body: "Student, Skilled, Partner, Family",
    Icon: IconPeople,
  },
  {
    title: "Trusted guidance",
    body: "Step-by-step planning from start to finish",
    Icon: IconTrustedBadge,
  },
];

/**
 * Premium Brisbane hero: viewport-wide left fog (white → clear), copy in content lane, bottom glass stats bar.
 *
 * @param {{ whatsappHref: string }} props
 */
export function HomeHeroPremium({ whatsappHref }) {
  return (
    <section
      className="home-hero-premium-section home-hero-premium-section--viewport-fit relative flex w-full min-w-0 flex-col overflow-x-clip"
      aria-labelledby="home-hero-heading"
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={HERO_BRISBANE_IMAGE.src}
            alt={HERO_BRISBANE_IMAGE.alt}
            fill
            className="object-cover object-[70%_center] md:object-bottom md:object-center"
            sizes="(max-width: 1024px) 100vw, min(100vw, 1920px)"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={HERO_BRISBANE_BLUR_DATA_URL}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/[0.04] via-transparent to-black/15 lg:from-transparent lg:to-black/20"
            aria-hidden
          />
        </div>

        {/* Linear white fade + masked blur: strongest at viewport left, clear toward river/CBD center */}
        <div className="home-hero-premium__fog-layer pointer-events-none absolute inset-y-0 z-[1]" aria-hidden>
          <div className="home-hero-premium__fog-gradient h-full w-full" />
        </div>

        <div className="home-hero-premium__content-column relative z-[2] flex min-h-0 w-full flex-1 flex-col">
          <div className="home-hero-premium__lane mx-auto flex w-full min-w-0 max-w-[var(--content-max)] flex-1 flex-col justify-end px-[var(--content-pad)] pb-20 pt-6 sm:pb-20 sm:pt-8 lg:pb-20 lg:pt-8">
            <div className="home-hero-premium__upper flex min-h-0 flex-1 flex-col justify-end pb-3 lg:justify-center lg:pb-0">
              <div className="home-hero-premium__glass-wrap hero__content home-hero-premium__content-card min-w-0">
                <div className="hero__glass home-hero-premium__glass-inner relative px-0 py-6 sm:py-8 lg:px-0 lg:py-9">
                  <p className="home-hero-premium__badge relative z-10 mb-6 inline-flex max-w-[34rem] flex-wrap items-center gap-2 rounded-full border border-white/45 bg-white/60 px-3.5 py-2.5 text-sm font-semibold shadow-sm sm:mb-7 sm:max-w-[36rem] sm:px-4 sm:py-3 sm:text-[0.9375rem] backdrop-blur-[20px]">
                    <span
                      className="flex shrink-0 items-center justify-center rounded-full p-1.5"
                      style={{ backgroundColor: iconSoft }}
                      aria-hidden
                    >
                      <IconLocationPin className="h-[18px] w-[18px]" stroke={plumMid} />
                    </span>
                    <span className="min-w-0 text-pretty leading-snug" style={{ color: charcoal }}>
                      <strong className="font-bold" style={{ color: plumMid }}>
                        Brisbane-based
                      </strong>
                      <span className="font-semibold"> • Pathways to Australia, Canada, the UK & NZ</span>
                    </span>
                  </p>

                  <h1
                    id="home-hero-heading"
                    className="home-hero-premium__heading relative z-10 max-w-none text-balance font-bold leading-[1.12] tracking-[-0.02em] text-[clamp(1.65rem,4vw,2.85rem)]"
                    style={{ color: plumDark }}
                  >
                    Clear migration and study{" "}
                    <span className="font-bold" style={{ color: plumMid }}>
                      pathway guidance
                    </span>{" "}
                    from Brisbane to the world
                  </h1>

                  <div
                    className="home-hero-premium__accent-line mt-4 h-1.5 w-14 rounded-full sm:mt-5 sm:w-16 lg:h-2 lg:w-[4.25rem]"
                    style={{ backgroundColor: plumMid }}
                    aria-hidden
                  />

                  <div className="relative z-10 mt-8 flex max-w-lg flex-col gap-3 sm:mt-9">
                    <TrackedLink
                      id="hero-cta-assessment"
                      href="/assessment"
                      eventName="cta_click"
                      eventParams={{
                        cta_id: "hero_pathway_questionnaire",
                        cta_location: "home_hero",
                        destination: "/assessment",
                      }}
                      aria-label="Start the pathway questionnaire"
                      className="home-hero-premium__cta inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-center text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.28)] outline-none ring-offset-2 ring-offset-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.35)] focus-visible:ring-2 focus-visible:ring-[#881337]/45 sm:w-auto sm:min-w-[280px]"
                      style={{ backgroundColor: plumMid }}
                    >
                      Start the pathway questionnaire →
                    </TrackedLink>

                    <p className="text-sm font-medium leading-relaxed text-[#1F1020]/72 sm:text-[0.9375rem]">
                      Need quick human help?{" "}
                      <TrackedAnchor
                        id="hero-cta-whatsapp"
                        href={whatsappHref}
                        eventName="cta_click"
                        eventParams={{ cta_id: "hero_whatsapp", cta_location: "home_hero", destination: "whatsapp" }}
                        aria-label="Open WhatsApp chat with MinRosh"
                        className="font-bold transition hover:opacity-90"
                        style={{ color: plumMid }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat on WhatsApp
                      </TrackedAnchor>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="home-hero-premium__bottom-bar w-full shrink-0"
              role="region"
              aria-label="Pathway highlights and trust signals"
            >
              <ul className="home-hero-premium__bottom-bar-list flex list-none flex-nowrap items-stretch gap-0 overflow-x-auto overscroll-x-contain py-1 pl-0 [-webkit-overflow-scrolling:touch] sm:flex-nowrap sm:justify-between sm:overflow-visible sm:py-0">
                {FEATURES.map((item, index) => {
                  const FeatureIcon = item.Icon;
                  return (
                    <li
                      key={item.title}
                      className={`home-hero-premium__bottom-bar-item flex min-w-[10.5rem] shrink-0 items-center justify-center gap-2.5 px-3 py-2 sm:min-w-0 sm:flex-1 sm:basis-0 sm:max-w-none sm:px-2 ${index > 0 ? "border-l border-[#1f1020]/10" : ""}`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-inner sm:h-10 sm:w-10"
                        style={{ backgroundColor: iconSoft }}
                        aria-hidden
                      >
                        <FeatureIcon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" stroke={plumMid} />
                      </div>
                      <div className="min-w-0 text-center">
                        <p className="text-xs font-bold leading-snug text-[#1f1020] sm:text-sm">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug text-[#1f1020]/68 sm:text-xs">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
                {TRUST_PILLARS.map((pillar, index) => {
                  const PillarIcon = pillar.Icon;
                  return (
                    <li
                      key={pillar.title}
                      className={`home-hero-premium__bottom-bar-item flex min-w-[10.5rem] shrink-0 items-center justify-center gap-2.5 px-3 py-2 sm:min-w-0 sm:flex-1 sm:basis-0 sm:max-w-none sm:px-2 ${FEATURES.length > 0 || index > 0 ? "border-l border-[#1f1020]/10" : ""}`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
                        style={{ backgroundColor: iconSoft }}
                        aria-hidden
                      >
                        <PillarIcon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" stroke={plumMid} />
                      </div>
                      <div className="min-w-0 text-center">
                        <p className="text-xs font-bold leading-snug text-[#1f1020] sm:text-sm">{pillar.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug text-[#1f1020]/68 sm:text-xs">
                          {pillar.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
