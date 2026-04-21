import Link from "next/link";
import { CountryCoverage } from "../country-coverage";
import { HomeOurServicesTabs } from "./home-our-services-tabs";
import { HomeHeroBento } from "./home-hero-bento";
import { NewsBoard } from "../news-board";
import { SmartNavigator } from "../smart-navigator";
import { PathwayMapDisclosure } from "./pathway-map-disclosure";
import { GoogleReviewsPanel } from "./google-reviews-panel";
import { PathwaySequenceAnimated } from "./pathway-sequence-animated";

const countryBannerLinks = [
  { label: "Australia", href: "/destinations/australia" },
  { label: "New Zealand", href: "/destinations/new-zealand" },
  { label: "Canada", href: "/destinations/canada" },
  { label: "United Kingdom", href: "/destinations/united-kingdom" },
];

const pathwaySummaryCards = [
  {
    title: "Skilled Migration",
    href: "/skilled-migration",
    benefit: "Points strategy and nomination-ready planning.",
    icon: "🧭",
  },
  {
    title: "Partner Visa",
    href: "/partner-visa-australia",
    benefit: "Relationship evidence and step-by-step sequencing.",
    icon: "🤝",
  },
  {
    title: "Student Visa",
    href: "/student-visa-australia",
    benefit: "Study pathway clarity with long-term planning.",
    icon: "🎓",
  },
  {
    title: "Employer Sponsored",
    href: "/employer-sponsored-visas",
    benefit: "Employer-backed options when direct PR is harder.",
    icon: "🏢",
  },
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

const quickServiceCards = [
  {
    title: "Points & Strategy",
    href: "/skilled-migration",
    summary: "Check points competitiveness and nomination direction before committing.",
  },
  {
    title: "Visa Application Support",
    href: "/book-consultation",
    summary: "Get a structured case conversation before major lodging decisions.",
  },
  {
    title: "Document Preparation",
    href: "/australia-visa-document-checklist-guide",
    summary: "Build cleaner evidence sets for fewer avoidable delays.",
  },
  {
    title: "Appeals / Complex Cases",
    href: "/visa-refusal-help-australia-and-aat-migration-appeal-guide",
    summary: "Understand realistic options when timelines or refusals add pressure.",
  },
];

/**
 * Server-rendered home tab: static sections + small client children (navigator, coverage, news).
 */
export function HomeTabServer({ siteData, newsData }) {
  const trustNote =
    "Registered Migration Agent support with structured planning across Australia and key destination pathways.";
  const spotlightStory = siteData.successStories?.[0];

  const generalHrefOrder = [
    "/skilled-migration",
    "/partner-visa-australia",
    "/visitor-visas",
    "/australian-visas-official-sources",
  ];
  const generalOrdered = generalHrefOrder
    .map((h) => siteData.services.find((s) => s.href === h))
    .filter(Boolean);
  const generalFeaturedServices = generalOrdered.slice(0, 3);
  const officialExtraService = generalOrdered[3] ?? null;
  const educationServices = siteData.services.filter((s) => s.href === "/student-visa-australia");
  const corporateServices = siteData.services.filter((s) => s.href === "/employer-sponsored-visas");

  return (
    <section className="landing-home-ref tab-panel is-active editorial-home bg-brand-cream/35 text-brand-plum">
      <HomeHeroBento siteData={siteData} trustNote={trustNote} />

      <section
        className="home-pathway-selector home-pathway-selector--below-wizard mx-auto mt-5 w-full max-w-7xl px-4 sm:px-6"
        aria-labelledby="home-pathway-selector-heading"
      >
        <div className="home-pathway-selector__head">
          <p className="section-label">Find your best pathway faster</p>
          <h2 id="home-pathway-selector-heading">Start with your visa goal, then explore full guidance below</h2>
          <p>
            Choose your likely direction first. Every detailed service section remains available further down this page.
          </p>
        </div>
        <div className="home-pathway-selector__grid">
          {pathwaySummaryCards.map((item, idx) => (
            <Link key={item.href} href={item.href} className="home-pathway-selector__card bento-hover">
              <span className="home-pathway-selector__num" aria-hidden>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3>{item.title}</h3>
              <p>{item.benefit}</p>
              <span className="home-pathway-selector__learn">Learn more</span>
            </Link>
          ))}
        </div>
        <p className="home-pathway-selector__not-sure">
          Not sure which pathway fits best?{" "}
          <Link href="/#quiz" className="home-pathway-selector__inline-link">
            Start Free Assessment
          </Link>
          .
        </p>
      </section>

      <section
        id="how-it-works"
        className="home-how-it-works mx-auto mt-4 w-full max-w-7xl scroll-mt-[calc(var(--site-header-chrome-height)+12px)] px-4 sm:px-6"
        aria-labelledby="home-how-it-works-heading"
      >
        <div className="home-how-it-works__head">
          <p className="section-label">How it works</p>
          <h2 id="home-how-it-works-heading">A clear next step in three simple stages</h2>
          <p>
            This summary helps you understand the flow quickly. Detailed pathway, service, and compliance guidance remains
            fully available in the sections below.
          </p>
        </div>
        <ol className="home-how-it-works__list">
          {siteData.processSteps.slice(0, 3).map((step, idx) => (
            <li key={step.title} className="home-how-it-works__item bento-hover">
              <span className="home-how-it-works__num" aria-hidden>
                {idx + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-trust-proof mx-auto mt-4 w-full max-w-7xl px-4 sm:px-6" aria-labelledby="home-trust-proof-heading">
        <div className="home-trust-proof__head">
          <p className="section-label">Trust and proof</p>
          <h2 id="home-trust-proof-heading">Confidence before you commit to the next step</h2>
          <p>
            Quick proof points first. Full service explanations, compliance messaging, and detailed guidance continue below.
          </p>
        </div>
        <div className="home-trust-proof__grid">
          {siteData.stats.slice(0, 3).map((stat) => (
            <article key={stat.label} className="home-trust-proof__card bento-hover">
              <p className="home-trust-proof__value">{stat.value}</p>
              <p className="home-trust-proof__label">{stat.label}</p>
            </article>
          ))}
        </div>
        {spotlightStory ? (
          <article className="home-trust-proof__story bento-hover" aria-label="Featured client outcome">
            <p className="home-trust-proof__story-title">Featured client outcome</p>
            <blockquote>{spotlightStory.quote}</blockquote>
            <p className="home-trust-proof__story-meta">
              {spotlightStory.name} · {spotlightStory.location} · {spotlightStory.visa}
            </p>
            <p className="home-trust-proof__story-outcome">
              {spotlightStory.outcome} ({spotlightStory.timeline})
            </p>
          </article>
        ) : null}
        <p className="home-trust-proof__actions">
          <Link href="/about">Read our full story</Link>
          <span aria-hidden>·</span>
          <Link href="/#stories">See more outcomes</Link>
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mb-4 text-center text-sm text-brand-plum/80">
          New:{" "}
          <Link href="/australian-visas-official-sources" className="font-semibold underline-offset-2 hover:underline">
            Australian visas — official sources hub
          </Link>{" "}
          (visa listing, Visa Finder, and how they connect to MinRosh pathway pages).
        </p>
      </div>
      <section
        id="smart-navigator"
        className="home-navigator-feature mx-auto max-w-7xl scroll-mt-[calc(var(--site-header-chrome-height)+12px)] px-4 sm:px-6"
        aria-labelledby="home-navigator-feature-heading"
      >
        <div className="home-navigator-feature__intro">
          <p className="section-label">Smart Pathway Navigator</p>
          <h2 id="home-navigator-feature-heading">Not sure where to start? Let the navigator shortlist your next step</h2>
          <p>
            In under a minute, it narrows your likely direction using your destination, intent, timing, and support needs.
            Detailed pathway pages and service sections remain available below.
          </p>
          <ul aria-label="Navigator benefits">
            <li>Quick shortlist before deep reading</li>
            <li>Lower confusion on first visit</li>
            <li>Clear bridge to consultation when needed</li>
          </ul>
        </div>
        <SmartNavigator
          title="Answer a few questions and get a more useful pathway recommendation"
          description="Our assessment weighs your destination, goal, timing, how much support you want, and how far along your pathway already is — then suggests the most relevant next page to read or action to take."
          primaryLabel="Open recommended page"
          finalHref="/book-consultation"
        />
      </section>

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

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-12" aria-label="Our services and visa categories">
        <HomeOurServicesTabs
          variant="home"
          quickServiceCards={quickServiceCards}
          visualHighlights={visualHighlights}
          generalFeaturedServices={generalFeaturedServices}
          officialExtraService={officialExtraService}
          educationServices={educationServices}
          corporateServices={corporateServices}
        />
      </div>

      <div className="mx-4 my-10 max-w-7xl sm:mx-6 xl:mx-auto">
        <PathwayMapDisclosure />
      </div>

      <article className="mx-auto max-w-4xl px-4 py-10 text-center text-brand-plum/75 sm:px-6 md:py-12">
        <h2 className="sr-only">Comprehensive Australian Migration Expertise</h2>
        <p className="font-medium leading-relaxed">
          MinRosh Migration provides registered migration guidance for Home Affairs pathways —{" "}
          <strong className="font-bold text-brand-plum">skilled, partner, student, and employer-sponsored</strong> — with
          structured planning, realistic timelines, and consultation when you are ready to move forward.
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

      <section className="home-final-cta mx-auto mb-8 w-full max-w-7xl px-4 sm:px-6" aria-labelledby="home-final-cta-heading">
        <div className="home-final-cta__inner">
          <p className="section-label">Ready when you are</p>
          <h2 id="home-final-cta-heading">Start your migration journey with clarity today</h2>
          <p>
            Take the free assessment first, then book consultation when you want case-specific direction. All service pages
            and detailed guidance remain available for deeper reading.
          </p>
          <div className="home-final-cta__actions">
            <Link href="/#quiz" className="home-hero-primary-cta home-final-cta__primary">
              Start Free Assessment
            </Link>
            <Link href="/book-consultation" className="home-final-cta__secondary">
              Book Consultation
            </Link>
          </div>
          <p className="home-trust-line home-final-cta__trust">
            Trusted by applicants across Australia and overseas • Private & secure • Brisbane-based support
          </p>
        </div>
      </section>

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
