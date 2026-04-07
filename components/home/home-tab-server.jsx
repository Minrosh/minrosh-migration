import Link from "next/link";
import { PublicFileImg } from "../public-file-img";
import { CountryCoverage } from "../country-coverage";
import { NewsBoard } from "../news-board";
import { SmartNavigator } from "../smart-navigator";

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
    src: "/images/brisbane-skyline.svg",
    alt: "Stylized illustration of the Brisbane skyline and riverfront",
  },
  {
    title: "Structured migration planning",
    caption: "A smoother pathway from first review through to practical next steps.",
    src: "/images/team-office.svg",
    alt: "Stylized illustration of colleagues collaborating at a table with laptops",
  },
  {
    title: "Destination-focused support",
    caption: "Stronger visual storytelling for Australia and wider migration goals.",
    src: "/images/hero-sydney.svg",
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
            src="/images/hero-sydney.svg"
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

      <section className="trust-strip editorial-section editorial-section--rail">
        {siteData.services.slice(0, 3).map((service) => (
          <Link
            key={service.title}
            href={service.href}
            className="trust-strip__item bento-hover trust-strip__link"
          >
            <p className="section-label">{service.title}</p>
            <p>{service.summary}</p>
          </Link>
        ))}
      </section>

      <section className="visual-strip editorial-section editorial-section--visual" aria-label="MinRosh highlights">
        {visualHighlights.map((item) => (
          <article key={item.title} className="visual-strip__card bento-hover">
            <div className="visual-strip__media">
              <PublicFileImg src={item.src} alt={item.alt} width={1400} height={1000} />
            </div>
            <div className="visual-strip__copy">
              <p className="section-label">{item.title}</p>
              <p>{item.caption}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="split-section editorial-section editorial-section--story">
        <div>
          <p className="section-label">Why Choose MinRosh</p>
          <h2>{siteData.about.title}</h2>
          <p>{siteData.about.body}</p>
          <ul className="feature-list">
            {siteData.about.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div className="image-card bento-hover">
          <PublicFileImg
            src="/images/team-office.svg"
            alt="Stylized illustration of a professional team meeting in a modern office"
            width={1200}
            height={800}
          />
        </div>
      </section>

      <section className="process-section">
        <div className="section-head section-head--process">
          <div>
            <p className="section-label">How It Works</p>
            <h2>A clearer process from first enquiry to action.</h2>
          </div>
          <p className="process-section__lead">{siteData.processSectionLead}</p>
        </div>
        <div className="process-grid">
          {siteData.processSteps.map((step, index) => (
            <article key={step.title} className="process-card bento-hover">
              <div className="process-card__top">
                <span className="process-card__number">{index + 1}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="news-section">
        <NewsBoard initialNews={newsData} limit={6} />
      </section>

      <section className="faq-section">
        <div className="section-head">
          <div>
            <p className="section-label">Frequently Asked Questions</p>
            <h2>Answers to common Australian visa questions</h2>
          </div>
        </div>
        <div className="faq-grid">
          {siteData.faq.map((item) => (
            <article key={item.question} className="faq-card bento-hover">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
