"use client";

import { PublicFileImg } from "../public-file-img";
import { TrackedAnchor, TrackedLink } from "../tracked-link";

/** Single marketing hero image: Brisbane River and CBD (see `/public/images/hero-brisbane-river-cbd.jpg`). */
const HERO_BRISBANE_IMAGE = {
  src: "/images/hero-brisbane-river-cbd.jpg",
  alt: "Brisbane River and CBD skyline at dusk with CityCat ferry",
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

function IconGradCap({ className = "h-[22px] w-[22px]", stroke = plumDark }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 10.5 12 7l7.5 3.5L12 14 4.5 10.5z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.2v2.6l3 1.5 3-1.5v-2.6M6 10.5V17"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
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
    title: "Pathways that fit you",
    text: "Student visas, skilled migration, partner and family pathways",
    Icon: IconGradCap,
  },
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
 * Premium Brisbane River / CBD homepage hero — glass columns pinned to the sides so the skyline stays visible mid-frame.
 *
 * @param {{ whatsappHref: string }} props
 */
export function HomeHeroPremium({ whatsappHref }) {
  return (
    <section
      className="home-hero-premium-section home-hero-premium-section--viewport-fit relative flex min-w-0 flex-col overflow-x-clip"
      aria-labelledby="home-hero-heading"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 z-0">
          <PublicFileImg
            src={HERO_BRISBANE_IMAGE.src}
            alt={HERO_BRISBANE_IMAGE.alt}
            className="absolute inset-0 h-full w-full object-cover object-[50%_45%] lg:object-[52%_42%]"
            width={1920}
            height={1280}
            priority
            fetchPriority="high"
            sizes="100vw"
          />
          {/* Light legibility wash only — keeps a clear lane over the river/CBD */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/[0.06] via-transparent to-black/20 lg:from-transparent lg:via-transparent lg:to-black/25"
            aria-hidden
          />
        </div>

        <div className="home-hero-premium__content-column relative z-[1] flex min-h-0 w-full flex-1 flex-col px-0 pb-12 pt-12 sm:pb-14 sm:pt-16 lg:pb-10 lg:pt-14">
          <div className="mx-auto w-full min-w-0 max-w-[var(--content-max)] px-[var(--content-pad)]">
            <div className="home-hero-premium__row">
              <div className="home-hero-premium__glass-wrap hero__content home-hero-premium__content-card min-w-0">
                <div className="hero__glass home-hero-premium__glass-inner relative overflow-hidden rounded-[2.5rem] px-6 py-8 sm:px-10 sm:py-10 lg:px-10 lg:py-10">
                  <p className="home-hero-premium__badge relative z-10 mb-7 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/50 px-3.5 py-2.5 text-sm font-semibold shadow-sm sm:mb-8 sm:px-4 sm:py-3 sm:text-[0.9375rem] lg:mb-5 bg-white/75 backdrop-blur-[20px]">
                  <span className="flex shrink-0 items-center justify-center rounded-full p-1.5" style={{ backgroundColor: iconSoft }} aria-hidden>
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
                    className="home-hero-premium__heading relative z-10 max-w-xl text-balance font-bold leading-[1.12] tracking-[-0.02em] text-[clamp(1.65rem,4vw,2.85rem)] lg:max-w-none"
                    style={{ color: plumDark }}
                  >
                    Clear migration and study{" "}
                    <span className="font-bold" style={{ color: plumMid }}>
                      pathway guidance
                    </span>{" "}
                    from Brisbane to the world
                  </h1>

                  <p className="hero__lead relative z-10 mt-5 max-w-xl text-base font-medium leading-relaxed text-[#1F1020]/80 sm:text-[1.05rem] lg:max-w-none">
                    Expert support for student, skilled, partner and family pathways with practical next steps tailored
                    to your profile.
                  </p>

                  <div
                    className="home-hero-premium__accent-line mt-5 h-1.5 w-14 rounded-full sm:mt-6 sm:w-16 lg:mt-4 lg:h-2 lg:w-[4.25rem]"
                    style={{ backgroundColor: plumMid }}
                    aria-hidden
                  />
                </div>
              </div>

              <aside className="home-hero-premium__trust-shell home-hero-premium__side-panel min-w-0 rounded-[1.75rem] border border-white/50 px-5 py-6 shadow-[0_18px_42px_rgba(31,16,32,0.14)] sm:px-8 sm:py-7 lg:px-7 lg:py-7">
                <ul className="grid list-none grid-cols-1 gap-5 pl-0 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
                {FEATURES.map((item) => {
                  const FeatureIcon = item.Icon;
                  return (
                    <li key={item.title} className="flex gap-3.5">
                      <div
                        className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full shadow-inner"
                        style={{ backgroundColor: iconSoft }}
                      >
                        <FeatureIcon stroke={plumMid} />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-bold leading-tight sm:text-base" style={{ color: plumDark }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#1F1020]/78">{item.text}</p>
                      </div>
                    </li>
                  );
                })}
                </ul>

                <div className="mt-6 border-t border-zinc-200/80 pt-5">
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
                    className="home-hero-premium__cta inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-center text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.28)] outline-none ring-offset-2 ring-offset-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.35)] focus-visible:ring-2 focus-visible:ring-[#881337]/45"
                    style={{ backgroundColor: plumMid }}
                  >
                    Start the pathway questionnaire →
                  </TrackedLink>

                <p className="mt-3 text-sm font-medium leading-relaxed text-[#1F1020]/72 sm:text-[0.9375rem]">
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

              <div className="mt-6 grid grid-cols-1 gap-5 border-t border-zinc-200/80 pt-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 lg:grid-cols-1">
                {TRUST_PILLARS.map((pillar) => {
                  const PillarIcon = pillar.Icon;
                  return (
                    <div key={pillar.title} className="flex gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: iconSoft }}
                        aria-hidden
                      >
                        <PillarIcon className="h-[18px] w-[18px]" stroke={plumMid} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight" style={{ color: plumDark }}>
                          {pillar.title}
                        </p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-[#1F1020]/72 sm:text-sm">
                          {pillar.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
