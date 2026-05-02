"use client";

import { PublicFileImg } from "../public-file-img";
import { TrackedAnchor, TrackedLink } from "../tracked-link";

const plumDark = "#1F1020"; // Near-black headings/body (mock)
const plumMid = "#881337"; // Maroon accents, CTAs, active nav (1920 mock)
const charcoal = "#1F1020";
const iconSoft = "#F5EAF0"; // Soft pinkish white for icon circles

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
 * Premium Brisbane skyline homepage hero — marketing homepage only (glass card + overlapping trust strip).
 *
 * @param {{ whatsappHref: string }} props
 */
export function HomeHeroPremium({ whatsappHref }) {
  return (
    <section
      className="home-hero-premium-section home-hero-premium-section--viewport-fit relative flex min-w-0 flex-col overflow-x-clip"
      aria-labelledby="home-hero-heading"
    >
      <div className="relative flex min-h-0 flex-1 flex-col justify-center">
        <div className="pointer-events-none absolute inset-0 z-0">
          <PublicFileImg
            src="/images/hero-brisbane-river-cbd.jpg"
            alt="Brisbane River and CBD skyline at sunset with CityCat ferry"
            className="absolute inset-0 h-full w-full object-cover object-[32%_center] sm:object-[34%_center] lg:object-[42%_52%]"
            width={1024}
            height={682}
            priority
            fetchPriority="high"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-white via-white/94 to-white/25 sm:via-white/88 lg:from-white lg:from-[38%] lg:via-white/42 lg:to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-white/28 via-transparent to-white/12 lg:from-white/14"
            aria-hidden
          />
        </div>

        <div className="home-hero-premium__content-column relative z-[1] mx-auto flex w-full max-w-7xl min-w-0 flex-col items-stretch px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:flex-1 lg:min-h-0 lg:justify-center lg:overflow-y-auto lg:px-6 lg:pb-8 lg:pt-8">
          <div className="home-hero-premium__glass-inner px-6 py-10 sm:px-10 sm:py-12 lg:px-0 lg:py-10">
            <p className="home-hero-premium__badge mb-7 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[rgba(58,28,44,0.08)] bg-white px-3.5 py-2.5 text-sm font-semibold shadow-[0_8px_28px_rgba(58,28,44,0.08)] sm:mb-8 sm:px-4 sm:py-3 sm:text-[0.9375rem] lg:mb-5">
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
              className="home-hero-premium__heading max-w-4xl text-balance font-bold leading-[1.12] tracking-[-0.02em] text-[clamp(1.65rem,4vw,2.85rem)] lg:max-w-5xl"
              style={{ color: plumDark }}
            >
              Clear migration and study{" "}
              <span className="font-bold" style={{ color: plumMid }}>
                pathway guidance
              </span>{" "}
              from Brisbane to the world
            </h1>

            <div
              className="home-hero-premium__accent-line mt-5 h-1.5 w-14 rounded-full sm:mt-6 sm:w-16 lg:mt-4 lg:h-2 lg:w-[4.25rem]"
              style={{ backgroundColor: plumMid }}
              aria-hidden
            />

            <ul className="mt-9 grid list-none grid-cols-1 gap-7 pl-0 sm:mt-10 lg:mt-6 lg:grid-cols-3 lg:gap-6">
              {FEATURES.map((item) => {
                const FeatureIcon = item.Icon;
                return (
                  <li key={item.title} className="flex gap-3.5 lg:gap-4">
                    <div
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full shadow-inner"
                      style={{ backgroundColor: iconSoft }}
                    >
                      <FeatureIcon stroke={plumMid} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-base font-bold leading-tight" style={{ color: plumDark }}>
                        {item.title}
                      </p>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#1F1020]/78 sm:text-[0.9375rem]">
                        {item.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-9 flex max-w-lg flex-col gap-4 sm:mt-11 lg:mt-6 lg:gap-3">
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
                className="home-hero-premium__cta inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-center text-base font-bold text-white shadow-[0_14px_36px_rgba(139,29,65,0.28)] outline-none ring-offset-2 ring-offset-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(139,29,65,0.35)] focus-visible:ring-2 focus-visible:ring-[#8B1D41]/45 sm:w-auto sm:min-w-[280px] sm:px-10 sm:text-lg"
                style={{ backgroundColor: plumMid }}
              >
                Start the pathway questionnaire →
              </TrackedLink>

              <p className="max-w-md text-sm font-medium leading-relaxed text-[#1F1020]/72 sm:text-[0.9375rem]">
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
                <br />
                <span className="text-[#1F1020]/68">Message us for scheduling or general pathway questions.</span>
              </p>
            </div>
          </div>

          <div className="relative z-[2] mx-auto mt-0 w-full max-w-[min(82rem,92vw)] px-1 sm:px-2">
            <div className="home-hero-premium__trust-shell -mt-8 rounded-[1.75rem] border border-zinc-200/80 bg-white px-5 py-6 shadow-[0_16px_48px_rgba(31,16,32,0.1)] backdrop-blur-sm sm:-mt-10 sm:px-8 sm:py-7 lg:-mt-11 lg:px-10 lg:py-6 xl:px-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-0 lg:gap-y-0">
                {TRUST_PILLARS.map((pillar, index) => {
                  const PillarIcon = pillar.Icon;
                  return (
                  <div
                    key={pillar.title}
                    className={`flex gap-3.5 sm:gap-4 ${
                      index > 0
                        ? `border-t border-zinc-200/90 pt-8 lg:border-l lg:border-t-0 lg:border-zinc-200/90 lg:pl-9 lg:pt-0 xl:pl-11 ${index === 1 ? "sm:border-t-0 sm:pt-0" : ""}`
                        : ""
                    }`}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                      style={{ backgroundColor: iconSoft }}
                      aria-hidden
                    >
                      <PillarIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" stroke={plumMid} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-tight" style={{ color: plumDark }}>
                        {pillar.title}
                      </p>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#1F1020]/72">{pillar.body}</p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
