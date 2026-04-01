import Link from "next/link";

export function ContentPage({
  eyebrow,
  title,
  intro,
  breadcrumbs = [],
  sections = [],
  faq = [],
  related = [],
  ctaTitle = "Ready to discuss your options?",
  ctaBody = "Start with a clear enquiry and MinRosh will help you map the most relevant next steps.",
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
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>

      <div className="content-page__grid">
        <div className="content-page__main">
          {sections.map((section) => (
            <section key={section.title} className="content-section bento-hover">
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
          ))}

          {faq.length ? (
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
          ) : null}
        </div>

        <aside className="content-page__aside">
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
