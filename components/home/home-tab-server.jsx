import Link from "next/link";
import { PublicFileImg } from "../public-file-img";
import { CountryCoverage } from "../country-coverage";
import { NewsBoard } from "../news-board";
import { SmartNavigator } from "../smart-navigator";
import { PathwayMapPanel } from "./pathway-map-panel";
import { GoogleReviewsPanel } from "./google-reviews-panel";

const countryBannerLinks = [
  { label: "Australia", href: "/destinations/australia" },
  { label: "New Zealand", href: "/destinations/new-zealand" },
  { label: "Canada", href: "/destinations/canada" },
  { label: "United Kingdom", href: "/destinations/united-kingdom" },
];

const heroStatIconVariants = ["guidance", "hubs", "tools"];

function HeroStatIcon({ variant }) {
  const svgProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };
  if (variant === "guidance") {
    return (
      <svg {...svgProps}>
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (variant === "hubs") {
    return (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.65" />
        <path
          d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <path
        d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v4M12 16h.01"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Home visual strip: three distinct on-repo assets (SVG illustrations). */
const visualHighlights = [
  {
    title: "Brisbane-based guidance",
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
    src: "/images/hero-sydney-real.jpg",
    alt: "Stylized illustration of Sydney Harbour suggesting Australian destinations",
  },
];

/**
 * Server-rendered home tab: static sections + small client children (navigator, coverage, news).
 */
export function HomeTabServer({ siteData, newsData }) {
  const trustNote =
    "Brisbane-based migration guidance across four destination systems, with education support and practical next-step planning.";

  return (
    <section className="tab-panel is-active editorial-home">
      <section className="hero editorial-section editorial-section--hero">
        <div className="hero__content">
          <div className="hero__glass">
            <p className="eyebrow">{siteData.hero.eyebrow}</p>
            <h1>{siteData.hero.title}</h1>
            <p className="hero__lead">{siteData.hero.description}</p>
            <div className="hero__actions">
              <Link href="/#quiz" className="btn btn-primary">
                {siteData.hero.primaryCta}
              </Link>
              <Link href="/book-consultation" className="btn btn-ghost">
                {siteData.hero.secondaryCta}
              </Link>
            </div>
            <p className="hero__trust-note">{trustNote}</p>
            <div className="hero__stats">
              {siteData.stats.map((stat, index) => (
                <div key={stat.label} className="hero__stat">
                  <span className="hero__stat-icon" aria-hidden="true">
                    <HeroStatIcon variant={heroStatIconVariants[index] ?? "tools"} />
                  </span>
                  <div className="hero__stat-body">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero__media" aria-hidden="true">
          <PublicFileImg
            src="/images/hero-sydney-real.jpg"
            alt="Stylized illustration of Sydney Harbour with the Opera House and water"
            width={1800}
            height={1200}
            priority
          />
        </div>
      </section>

      <SmartNavigator
        title="Answer a few questions and get a more useful pathway recommendation"
        description="Our assessment weighs your destination, goal, timing, how much support you want, and how far along your pathway already is — then suggests the most relevant next page to read or action to take."
        primaryLabel="Open recommended page"
        finalHref="/book-consultation"
      />

      <section className="country-banner editorial-section editorial-section--compact" aria-label="Countries MinRosh supports">
        {countryBannerLinks.map((item) => (
          <Link key={item.href} href={item.href} className="country-banner__link">
            {item.label}
          </Link>
        ))}
      </section>

      <CountryCoverage countries={siteData.countries} />

      <section
        className="home-services-visual editorial-section editorial-section--visual"
        aria-label="Core services and visual highlights"
      >
        <div className="section-head">
          <div>
            <p className="section-label">How we help</p>
            <h2>Structured pathways across your main visa goals</h2>
          </div>
        </div>
        <div className="home-services-visual__grid">
          {siteData.services.slice(0, 3).map((service, index) => {
            const highlight = visualHighlights[index] ?? visualHighlights[0];
            return (
              <article key={service.title} className="home-services-visual__card bento-hover">
                <Link href={service.href} className="home-services-visual__card-link">
                  <div className="home-services-visual__media">
                    <PublicFileImg
                      src={highlight.src}
                      alt={highlight.alt}
                      width={1400}
                      height={1000}
                    />
                  </div>
                  <div className="home-services-visual__body">
                    <p className="section-label">{service.title}</p>
                    <p className="home-services-visual__eyebrow">{highlight.title}</p>
                    <p className="home-services-visual__caption">{highlight.caption}</p>
                    <p className="home-services-visual__summary">{service.summary}</p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <PathwayMapPanel />

      <section className="split-section editorial-section editorial-section--story home-about-process">
        <div className="home-about-process__about">
          <p className="section-label">Why Choose MinRosh</p>
          <h2>{siteData.about.title}</h2>
          <p>{siteData.about.body}</p>
          <ul className="feature-list">
            {siteData.about.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="home-process-timeline">
          <p className="section-label">How It Works</p>
          <h2>A clearer process from first enquiry to action.</h2>
          <p className="home-process-timeline__lead">{siteData.processSectionLead}</p>
          <ol className="home-process-timeline__list">
            {siteData.processSteps.map((step, index) => (
              <li key={step.title} className="home-process-timeline__item">
                <span className="home-process-timeline__num" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="home-process-timeline__copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="news-section">
        <NewsBoard initialNews={newsData} limit={6} carousel />
      </section>

      <GoogleReviewsPanel carousel />

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
