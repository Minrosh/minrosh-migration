import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { GlossaryParagraph } from "./glossary-paragraph";
import { personalizedCtaForPath, recommendedLinksForPath } from "../lib/content-personalization";

/** Stable in-page anchors for section titles (deduped with index). */
export function sectionAnchorId(title, index) {
  const base = String(title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "section"}-${index}`;
}

export function ContentPage({
  eyebrow,
  title,
  intro,
  breadcrumbs = [],
  sections = [],
  officialResources = [],
  faq = [],
  related = [],
  currentPath = "",
  /** Optional regulatory / compliance callout (e.g. TSMIT). */
  alertBanner = null,
  heroImage = { src: "/images/brisbane-skyline.jpg", alt: "Brisbane skyline and riverfront" },
  ctaTitle = "",
  ctaBody = "",
  /** Optional tools/widgets in the aside (e.g. TSMIT calculator). */
  asideTools = null,
}) {
  const resolvedPath = currentPath || breadcrumbs[breadcrumbs.length - 1]?.href || "";
  const personalizedCta = personalizedCtaForPath(resolvedPath);
  const mergedRelated = [
    ...related,
    ...recommendedLinksForPath(resolvedPath).filter((item) => item.href !== resolvedPath),
  ];
  const dedupedRelated = mergedRelated.filter(
    (item, index) => mergedRelated.findIndex((candidate) => candidate.href === item.href) === index
  );

  const tocEntries = [];
  sections.forEach((section, index) => {
    tocEntries.push({ id: sectionAnchorId(section.title, index), label: section.title });
  });
  if (faq.length) {
    tocEntries.push({ id: "page-faq", label: "FAQ" });
  }
  const showToc = tocEntries.length >= 2;

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
            <GlossaryParagraph text={intro} />
            {alertBanner ? (
              <div className="content-alert-banner" role="note">
                <strong>{alertBanner.title}</strong>
                <GlossaryParagraph text={alertBanner.body} />
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
          {showToc ? (
            <nav className="content-page__toc content-page__toc--inline" aria-label="On this page">
              <p className="content-page__toc-label">On this page</p>
              <ul className="content-page__toc-list">
                {tocEntries.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

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
            <div key={`${section.title}-${index}`} id={sectionAnchorId(section.title, index)} className="content-section-anchor">
              {index > 0 || officialResources.length ? (
                <hr className="content-divider" aria-hidden="true" />
              ) : null}
              <details className="content-section content-accordion bento-hover" open={index === 0}>
                <summary className="content-accordion__summary">
                  <h2>{section.title}</h2>
                </summary>
                <div className="content-accordion__body">
                  <GlossaryParagraph text={section.body} />
                  {section.bullets?.length ? (
                    <ul className="feature-list">
                      {section.bullets.map((item) => (
                        <li key={item}>
                          <GlossaryParagraph text={item} as="span" />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            </div>
          ))}

          {faq.length ? (
            <>
              <hr className="content-divider" aria-hidden="true" />
            <section className="faq-section" id="page-faq">
              <div className="section-head">
                <div>
                  <p className="section-label">FAQ</p>
                  <h2>Frequently Asked Questions</h2>
                </div>
              </div>
              <div className="faq-grid">
                {faq.map((item) => (
                  <details key={item.question} className="faq-card faq-card--accordion bento-hover">
                    <summary className="faq-card__summary">
                      <h3>{item.question}</h3>
                    </summary>
                    <div className="faq-card__body">
                      <GlossaryParagraph text={item.answer} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
            </>
          ) : null}
        </div>

        <aside className="content-page__aside">
          {showToc ? (
            <nav className="content-page__toc content-page__toc--sticky" aria-label="On this page">
              <div className="content-page__toc-inner bento-hover">
                <p className="content-page__toc-label">On this page</p>
                <ol className="content-page__toc-list content-page__toc-list--numbered">
                  {tocEntries.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          ) : null}
          {asideTools ? <div className="content-page__aside-tools">{asideTools}</div> : null}
          <div className="content-aside-card bento-hover">
            <p className="section-label">Next steps</p>
            <h3>{ctaTitle || personalizedCta.title}</h3>
            <GlossaryParagraph text={ctaBody || personalizedCta.body} />
            <div className="content-aside-card__actions">
              <Link href="/book-consultation" className="btn btn-primary">
                Book consultation
              </Link>
              <Link href="/assessment" className="btn btn-ghost">
                Free assessment
              </Link>
              <Link href="/#quiz" className="content-aside-card__text-link">
                Open points wizard on homepage
              </Link>
            </div>
          </div>

          {dedupedRelated.length ? (
            <div className="content-aside-card bento-hover">
              <p className="section-label">Related Pages</p>
              <div className="content-links">
                {dedupedRelated.map((item) => (
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
