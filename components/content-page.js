import Link from "next/link";
import Image from "next/image";
import { BreadcrumbsNav } from "./breadcrumbs-nav";
import { GlossaryParagraph } from "./glossary-paragraph";
import { MotionReveal, MotionStagger, MotionItem } from "./ui/motion-wrapper";
import { StructuredData } from "./structured-data";
import { faqJsonLd } from "../lib/seo";
import { personalizedCtaForPath, recommendedLinksForPath } from "../lib/content-personalization";

function IconCheckPremium({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDocPremium({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V7l-4-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 2v5h4M10 13h4M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChatPremium({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12a8 8 0 01-8 8H9l-4 3v-3H5a8 8 0 118 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const HOW_ICON_MAP = {
  documents: IconDocPremium,
  strategy: IconChatPremium,
  default: IconChatPremium,
};

function ContentBodyWithOptionalLeftRail({ leftRail, children }) {
  if (!leftRail) return children;
  return (
    <div className="content-page__with-left-rail">
      <aside className="content-page__left-rail" aria-label="Related pathways">
        {leftRail}
      </aside>
      <div className="content-page__left-rail-body">{children}</div>
    </div>
  );
}

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
  heroImage = { src: "/images/brisbane-skyline.v2.webp", alt: "Brisbane skyline and riverfront" },
  ctaTitle = "",
  ctaBody = "",
  /** Optional tools/widgets in the aside (e.g. TSMIT calculator). */
  asideTools = null,
  /** Optional rich block after official sources (e.g. lifestyle experience). */
  mainLead = null,
  /** Optional quick summary for the top of the page. */
  summary = null,
  /** Optional top 3 action steps for the takeaways box. */
  takeaways = [],
  /** Full-width block directly under the hero (e.g. hub pathway cards). */
  belowHero = null,
  /** Extra classes on the root article (e.g. layout modifiers). */
  articleClassName = "",
  /** Subtle route-specific accent for service landings (hero border tone). */
  routeAccent = "",
  /** Optional checklist bullets (visa guides — indicative prompts, not eligibility guarantees). */
  eligibilityChecklist = [],
  /** Optional “how we help” cards: `{ title, body, icon?: 'documents' | 'strategy' }`. */
  howWeHelp = [],
  /** Optional sticky left column (e.g. visa family shortcuts — prototype “visa subpage” nav). */
  leftRail = null,
  /** Optional custom hero node to replace default content-hero section. */
  heroSlot = null,
  /** Enable glass/frosted surfaces for TOC, aside cards, and premium info blocks. */
  enablePremiumGuideSurfaces = false,
  /** Optional class string for the primary CTA in the aside card. */
  primaryCtaClassName = "",
}) {
  const resolvedPath = currentPath || breadcrumbs[breadcrumbs.length - 1]?.href || "";
  const personalizedCta = personalizedCtaForPath(resolvedPath);
  const mergedRelated = [
    ...related,
    ...recommendedLinksForPath(resolvedPath).filter((item) => item.href !== resolvedPath),
  ];
  const dedupedRelated = mergedRelated.filter(
    (item, index) =>
      item.href !== resolvedPath &&
      mergedRelated.findIndex((candidate) => candidate.href === item.href) === index
  );

  const tocEntries = [];
  sections.forEach((section, index) => {
    tocEntries.push({ id: sectionAnchorId(section.title, index), label: section.title });
  });
  if (faq.length) {
    tocEntries.push({ id: "page-faq", label: "FAQ" });
  }
  const showToc = tocEntries.length >= 2;
  const faqSchema = faq.length ? faqJsonLd(faq) : null;

  const articleClasses = ["content-page", articleClassName, routeAccent ? `content-page--accent-${routeAccent}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClasses}>
      {faqSchema ? <StructuredData data={faqSchema} /> : null}
      {breadcrumbs.length ? (
        <BreadcrumbsNav
          currentPath={resolvedPath}
          items={breadcrumbs.map((item) => ({ label: item.label, href: item.href }))}
        />
      ) : null}

      <ContentBodyWithOptionalLeftRail leftRail={leftRail}>
      {heroSlot ? (
        heroSlot
      ) : (
        <MotionReveal as="section" className="content-hero">
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
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                width={1600}
                height={900}
                className="h-full w-full object-cover object-center sm:object-[70%_center] md:object-[center_bottom]"
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1600px, 100vw"
              />
            </div>
          </div>
        </MotionReveal>
      )}

      {belowHero ? <div className="content-page__below-hero">{belowHero}</div> : null}

      {summary ? (
        <div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-dashed border-brand-plum/10 bg-brand-plum/5 p-5 relative overflow-hidden group sm:p-8">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <span className="text-8xl font-black italic">!</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-rose mb-4 flex items-center gap-2">
              <span className="h-1 w-4 bg-brand-rose rounded-full" />
              Key Takeaways
            </p>
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <div>
                <p className="text-sm font-bold text-brand-plum/40 uppercase tracking-widest mb-2">Who this is for</p>
                <p className="text-base font-semibold text-brand-plum leading-relaxed">{summary}</p>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold text-brand-plum/40 uppercase tracking-widest mb-2">Top 3 actions</p>
                <ul className="space-y-3">
                  {(takeaways?.length ? takeaways : [
                    "Complete the initial profile quiz",
                    "Verify occupation on the priority list",
                    "Schedule a strategy discussion"
                  ]).slice(0, 3).map((action, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-brand-plum">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-rose text-[10px] text-white">{i + 1}</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="content-page__grid">
        <div className="content-page__main">
          {showToc ? (
            <nav className="content-page__toc content-page__toc--inline mb-12" aria-label="On this page">
              <p className="text-sm font-black text-brand-plum uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="h-0.5 w-8 bg-brand-plum/10" />
                Table of Contents
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {tocEntries.map((item) => (
                  <li key={item.id}>
                    <a 
                      href={`#${item.id}`} 
                      className="flex min-h-[48px] touch-manipulation items-center gap-3 rounded-xl border border-brand-plum/5 p-4 hover:border-brand-rose/20 hover:bg-brand-rose/[0.02] transition-all group"
                    >
                      <span className="text-[10px] font-black text-brand-plum/20 group-hover:text-brand-rose transition-colors">→</span>
                      <span className="text-sm font-bold text-brand-plum/70 group-hover:text-brand-plum transition-colors">{item.label}</span>
                    </a>
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

          {eligibilityChecklist?.length || howWeHelp?.length ? (
            <div className="content-premium-blocks">
              {eligibilityChecklist?.length ? (
                <section
                  className={`content-premium-eligibility${enablePremiumGuideSurfaces ? " glass-card premium-frosted-surface" : ""}`}
                  aria-labelledby="eligibility-checklist-heading"
                >
                  <h2 id="eligibility-checklist-heading">Eligibility checklist</h2>
                  <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
                    Use this as a preparation lens—always confirm against current official criteria for your subclass.
                  </p>
                  <ul>
                    {eligibilityChecklist.map((line) => (
                      <li key={line}>
                        <span className="content-premium-eligibility__icon" aria-hidden>
                          <IconCheckPremium />
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {howWeHelp?.length ? (
                <section
                  className={`content-premium-how-we-help${enablePremiumGuideSurfaces ? " glass-card premium-frosted-surface" : ""}`}
                  aria-labelledby="how-we-help-heading"
                >
                  <h2 id="how-we-help-heading">How we help</h2>
                  <div className="content-premium-how-we-help__grid">
                    {howWeHelp.map((item) => {
                      const key = item.icon === "documents" || item.icon === "strategy" ? item.icon : "default";
                      const IconCmp = HOW_ICON_MAP[key] || HOW_ICON_MAP.default;
                      return (
                        <div key={item.title} className="content-premium-how-we-help__item">
                          <div className="content-premium-how-we-help__icon" aria-hidden>
                            <IconCmp />
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.body}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {mainLead}

          <MotionStagger>
          {sections.map((section, index) => (
            <MotionItem key={`${section.title}-${index}`}>
            <div id={sectionAnchorId(section.title, index)} className="content-section-anchor">
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
            </MotionItem>
          ))}
          </MotionStagger>

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
              <div className={`content-page__toc-inner bento-hover${enablePremiumGuideSurfaces ? " glass-card premium-frosted-surface" : ""}`}>
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
          <div className={`content-aside-card bento-hover${enablePremiumGuideSurfaces ? " glass-card premium-frosted-surface" : ""}`}>
            <p className="section-label">Next steps</p>
            <h3>{ctaTitle || personalizedCta.title}</h3>
            <GlossaryParagraph text={ctaBody || personalizedCta.body} />
            <div className="content-aside-card__actions">
              <Link
                href="/book-consultation"
                className={`${primaryCtaClassName || "btn btn-primary"} min-h-[48px] touch-manipulation`}
              >
                Book Consultation
              </Link>
              <Link href="/assessment" className="btn btn-ghost min-h-[48px] touch-manipulation">
                Free Assessment
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-brand-plum/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-brand-plum/5 flex items-center justify-center text-[10px] font-black text-brand-plum/40 border border-brand-plum/10">MARA</div>
                <p className="text-[10px] font-bold text-brand-plum/60 leading-tight">
                  Registered Migration Agent <br />
                  <span className="text-brand-rose">MARN 1801042</span>
                </p>
              </div>
            </div>
          </div>

          {dedupedRelated.length ? (
            <div className={`content-aside-card bento-hover${enablePremiumGuideSurfaces ? " glass-card premium-frosted-surface" : ""}`}>
              <p className="section-label">Related Pages</p>
              <div className="content-links">
                {dedupedRelated.map((item) => (
                  <Link key={item.href} href={item.href} className="content-links__item">
                    <span className="content-links__kicker">Related guide</span>
                    <strong>{item.title}</strong>
                    <span className="content-links__arrow" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
      </ContentBodyWithOptionalLeftRail>
    </article>
  );
}
