import Link from "next/link";
import Image from "next/image";
import { CountryCoverage } from "../country-coverage";
import { HomeHeroBento } from "./home-hero-bento";
import { NewsBoard } from "../news-board";
import { SmartNavigator } from "../smart-navigator";
import { PathwayMapPanel } from "./pathway-map-panel";
import { GoogleReviewsPanel } from "./google-reviews-panel";
import { PathwaySequenceAnimated } from "./pathway-sequence-animated";

const countryBannerLinks = [
  { label: "Australia", href: "/destinations/australia" },
  { label: "New Zealand", href: "/destinations/new-zealand" },
  { label: "Canada", href: "/destinations/canada" },
  { label: "United Kingdom", href: "/destinations/united-kingdom" },
];

/** Home visual strip: raster marketing assets under `/public/images`. */
const visualHighlights = [
  {
    title: "Australia-wide perspective",
    caption: "Local visibility with a calmer, more premium first impression.",
    src: "/images/brisbane-skyline.jpg",
    alt: "Stylized illustration of the Brisbane skyline and riverfront",
  },
  {
    title: "Structured migration planning",
    caption: "A smoother pathway from first review through to practical next steps.",
    src: "/images/team-office-real.jpg",
    alt: "Stylized illustration of colleagues collaborating at a table with laptops",
  },
  {
    title: "Destination-focused support",
    caption: "Stronger visual storytelling for Australia and wider migration goals.",
    src: "/images/visual-strip-destinations.jpg",
    alt: "Collage of destination imagery representing multi-country migration guidance",
  },
];

/**
 * Server-rendered home tab: static sections + small client children (navigator, coverage, news).
 */
export function HomeTabServer({ siteData, newsData }) {
  const trustNote =
    "Registered Migration Agent support with structured planning across Australia and key destination pathways.";

  return (
    <section className="tab-panel is-active editorial-home bg-brand-cream/35 text-brand-plum">
      <HomeHeroBento siteData={siteData} trustNote={trustNote} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mb-4 text-center text-sm text-brand-plum/80">
          New:{" "}
          <Link href="/australian-visas-official-sources" className="font-semibold underline-offset-2 hover:underline">
            Australian visas — official sources hub
          </Link>{" "}
          (visa listing, Visa Finder, and how they connect to MinRosh pathway pages).
        </p>
        <SmartNavigator
          title="Answer a few questions and get a more useful pathway recommendation"
          description="Our assessment weighs your destination, goal, timing, how much support you want, and how far along your pathway already is — then suggests the most relevant next page to read or action to take."
          primaryLabel="Open recommended page"
          finalHref="/book-consultation"
        />
      </div>

      <section
        className="country-banner editorial-section editorial-section--compact mx-4 mt-2 max-w-7xl sm:mx-6 xl:mx-auto"
        aria-label="Countries MinRosh supports"
      >
        {countryBannerLinks.map((item) => (
          <Link key={item.href} href={item.href} className="country-banner__link">
            {item.label}
          </Link>
        ))}
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <CountryCoverage countries={siteData.countries} />
      </div>

      <section
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14"
        aria-label="Core services and visual highlights"
      >
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full border border-brand-rose/25 bg-brand-rose/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-brand-rose backdrop-blur-sm">
            How we help
          </p>
          <h2 className="mb-4 text-balance text-[2rem] font-extrabold leading-tight tracking-tight text-brand-plum md:text-4xl lg:text-5xl">
            Structured pathways across your main visa goals
          </h2>
          <p className="text-lg text-brand-plum/75">
            Looking for a migration agent in Australia? We help you compare pathways, reduce refusal risk, and move with a clearer plan.
          </p>
          <p className="mt-4 text-brand-plum/60">
            Get practical guidance for skilled, partner, student, and employer-sponsored visas with consultation-ready next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {siteData.services.slice(0, 3).map((service, index) => {
            const highlight = visualHighlights[index] ?? visualHighlights[0];
            return (
              <article
                key={service.title}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-brand-plum/10 backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-plum/15"
              >
                <Link
                  href={service.href}
                  className="flex h-full min-h-0 flex-col rounded-3xl no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
                >
                  <div className="relative h-56 shrink-0 overflow-hidden bg-brand-cream">
                    <Image
                      src={highlight.src}
                      alt={highlight.alt}
                      width={1400}
                      height={1000}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="flex grow flex-col p-6 sm:p-7">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-gold">{highlight.title}</p>
                    <h3 className="mb-4 text-xl font-bold leading-snug text-brand-plum sm:text-2xl">{service.title}</h3>
                    <p className="mb-5 rounded-r-lg border-l-2 border-brand-gold bg-brand-cream/60 py-1 pl-4 text-sm italic text-brand-plum/65">
                      &ldquo;{highlight.caption}&rdquo;
                    </p>
                    <p className="mb-6 flex-grow leading-relaxed text-brand-plum/75 transition group-hover:text-brand-plum">
                      {service.summary}
                    </p>
                    <div className="mt-auto flex items-center font-bold tracking-wide text-brand-rose transition group-hover:text-brand-plum">
                      Learn more
                      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mx-4 my-10 max-w-7xl rounded-[2rem] border border-brand-plum/10 bg-white/90 p-4 shadow-inner sm:mx-6 sm:p-6 xl:mx-auto">
        <PathwayMapPanel />
      </div>

      <article className="mx-auto max-w-4xl px-4 py-10 text-center text-brand-plum/75 sm:px-6 md:py-14">
        <h2 className="sr-only">Comprehensive Australian Migration Expertise</h2>
        <p className="mb-4 font-medium leading-relaxed">
          MinRosh Migration is a trusted Migration Agent in Australia. We specialize in navigating the complexities of the Department of Home Affairs, offering end-to-end guidance for{" "}
          <strong className="font-bold text-brand-plum">Skilled Migration, Partner Visas, Student Pathways</strong>, and{" "}
          <strong className="font-bold text-brand-plum">Employer-Sponsored Programs</strong>.
        </p>
        <p className="font-medium leading-relaxed">
          Whether you are aiming to study in Australia, sponsor a workforce, or secure a pathway to Permanent Residency (PR), our structured approach mitigates application risks. We empower candidates with realistic 2026 Skills in Demand (SID) insights to optimize their success metrics.
        </p>
      </article>

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 md:py-14">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-brand-cream/50 to-white" aria-hidden />
        <div className="relative z-[1] mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative z-10 xl:pr-10">
            <p className="mb-4 inline-block rounded-full border border-brand-rose/25 bg-brand-rose/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-brand-rose">
              Why Choose MinRosh
            </p>
            <h2 className="mb-5 text-balance text-[2rem] font-extrabold leading-tight tracking-tight text-brand-plum md:text-4xl lg:text-5xl">
              {siteData.about.title}
            </h2>
            <p className="mb-8 text-lg font-medium leading-relaxed text-brand-plum/75">{siteData.about.body}</p>
            <p className="mb-8 text-brand-plum/60">
              We retain detailed, search-friendly guidance so visitors can understand process, costs, timelines, and eligibility
              before booking a consultation.
            </p>

            <div className="space-y-4">
              {siteData.about.points.map((point) => (
                <div
                  key={point}
                  className="group flex cursor-default items-start gap-4 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-md backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:border-brand-gold/40 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-rose shadow-inner transition group-hover:scale-110 group-hover:bg-brand-rose group-hover:text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="pt-3 font-bold leading-snug text-brand-plum transition group-hover:text-brand-rose">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full border border-brand-rose/25 bg-brand-cream/60 px-6 py-3 text-lg font-extrabold text-brand-rose transition hover:border-brand-plum/20 hover:bg-brand-cream"
              >
                Read our full story
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="relative lg:pl-10">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-rose/15 to-brand-gold/10 blur-3xl"
              aria-hidden
            />
            <PathwaySequenceAnimated />
          </div>
        </div>
      </section>

      <section className="news-section">
        <NewsBoard initialNews={newsData} limit={6} carousel />
      </section>

      <div className="mx-4 mb-10 max-w-7xl rounded-[2rem] border border-brand-plum/10 bg-white/90 p-4 shadow-inner sm:mx-6 sm:p-6 xl:mx-auto">
        <GoogleReviewsPanel carousel />
      </div>

      <section className="faq-section">
        <div className="section-head">
          <div>
            <p className="section-label">Frequently Asked Questions</p>
            <h2>Answers to common Australian visa questions</h2>
          </div>
        </div>
        <div className="faq-accordion-list">
          {siteData.faq.slice(0, 3).map((item) => (
            <details key={item.question} className="faq-accordion bento-hover">
              <summary>{item.question}</summary>
              <div className="faq-accordion__body">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
        <p className="faq-section__more-wrap">
          <Link href="/faq" className="faq-section__more">
            View all FAQs
          </Link>
        </p>
      </section>
    </section>
  );
}
