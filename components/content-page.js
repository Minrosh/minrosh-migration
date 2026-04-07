import Link from "next/link";
import { PublicFileImg } from "./public-file-img";

export function ContentPage({
  eyebrow,
  title,
  intro,
  breadcrumbs = [],
  sections = [],
  officialResources = [],
  faq = [],
  related = [],
  /** Optional regulatory / compliance callout (e.g. TSMIT). */
  alertBanner = null,
  heroImage = { src: "/images/brisbane-skyline.jpg", alt: "Brisbane skyline and riverfront" },
  ctaTitle = "Ready to discuss your options?",
  ctaBody = "Start with a clear enquiry and MinRosh will help you map the most relevant next steps.",
  /** Optional tools/widgets in the aside (e.g. TSMIT calculator). */
  asideTools = null,
}) {
  return (
    <article className="content-page">
      {breadcrumbs.length ? (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? <span className="breadcrumbs__sep">/</span> : null}
              <Link href={item.href}>{item.label}</Link>
            </span>
          ))}
        </nav>
      ) : null}

      <section className="content-hero">
        <div className="content-hero__grid">
          <div className="content-hero__copy">
            <p className="section-label">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{intro}</p>
            {alertBanner ? (
              <div className="content-alert-banner" role="note">
                <strong>{alertBanner.title}</strong>
                <p>{alertBanner.body}</p>
                {alertBanner.href ? (
                  <p className="content-alert-banner__link">
                    <a href={alertBanner.href} target="_blank" rel="noreferrer">
                      {alertBanner.linkLabel || "Official source"}
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="content-hero__media" aria-hidden="true">
            <PublicFileImg src={heroImage.src} alt={heroImage.alt} width={1600} height={900} />
          </div>
        </div>
      </section>

      <div className="content-page__grid">
        <div className="content-page__main">
          {officialResources.length ? (
            <section className="official-resources" aria-label="Official government sources">
              <h2>Official sources to verify requirements</h2>
              <ul>
                {officialResources.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {sections.map((section, index) => (
            <div key={section.title}>
              {index > 0 || officialResources.length ? (
                <hr className="content-divider" aria-hidden="true" />
              ) : null}
              <section className="content-section bento-hover">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.bullets?.length ? (
                  <ul className="feature-list">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </div>
          ))}

          {faq.length ? (
            <>
              <hr className="content-divider" aria-hidden="true" />
            <section className="faq-section">
              <div className="section-head">
                <div>
                  <p className="section-label">FAQ</p>
                  <h2>Frequently Asked Questions</h2>
                </div>
              </div>
              <div className="faq-grid">
                {faq.map((item) => (
                  <article key={item.question} className="faq-card bento-hover">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
            </>
          ) : null}
        </div>

        <aside className="content-page__aside">
          {asideTools ? <div className="content-page__aside-tools">{asideTools}</div> : null}
          <div className="content-aside-card bento-hover">
            <p className="section-label">Next Step</p>
            <h3>{ctaTitle}</h3>
            <p>{ctaBody}</p>
            <div className="content-aside-card__actions">
              <Link href="/book-consultation" className="btn btn-primary">
                Book Consultation
              </Link>
              <Link href="/#quiz" className="btn btn-ghost">
                Check Eligibility
              </Link>
            </div>
          </div>

          {related.length ? (
            <div className="content-aside-card bento-hover">
              <p className="section-label">Related Pages</p>
              <div className="content-links">
                {related.map((item) => (
                  <Link key={item.href} href={item.href} className="content-links__item">
                    <strong>{item.title}</strong>
                    <span>Open page</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
