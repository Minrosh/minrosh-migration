import Link from "next/link";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { PublicFileImg } from "../../components/public-file-img";
import { getNewsData } from "../../lib/news-data";
import { NewsBoard } from "../../components/news-board";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { getHomeSiteData } from "../../lib/home-site-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

const pageData = seoPages.servicePages.updatesHub;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: pageData.keywords,
});

export const revalidate = 60;

export default function UpdatesPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const newsData = getNewsData();
  const latestGuides = [
    seoPages.guidePages.australianVisasOfficialSources,
    seoPages.guidePages.visaFeesGuide,
    seoPages.guidePages.processingTimesGuide,
    seoPages.guidePages.documentChecklistGuide,
    seoPages.guidePages.countryComparisonGuide,
  ];

  return (
    <SiteShell siteData={siteData} currentPath={pageData.path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visa Updates", path: pageData.path },
        ])}
      />
      <section className="content-page">
        <BreadcrumbsNav
          currentPath={pageData.path}
          items={[
            { label: "Home", href: "/" },
            { label: "Visa updates", href: pageData.path },
          ]}
        />
        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">{pageData.sectionLabel}</p>
              <h1>{pageData.headline}</h1>
              <p>{pageData.intro}</p>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/hero-brisbane-river-cbd-hd.jpg"
                alt="Brisbane CBD skyline and River at dusk for migration updates"
                width={1600}
                height={900}
                className="h-full w-full object-cover object-[70%_center] md:object-[center_bottom]"
                priority
                sizes="(max-width: 768px) 100vw, 1600px"
              />
            </div>
          </div>
        </section>

        {(pageData.officialResources ?? []).length ? (
          <section className="official-resources" aria-label="Official government sources">
            <h2>Verify Australian visa subclasses on Home Affairs</h2>
            <ul>
              {(pageData.officialResources ?? []).map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="content-section bento-hover immigration-news-cta-strip">
          <h2>Immigration newsroom</h2>
          <p>
            Open the full list of MinRosh notes on policy changes — each item has its own page with context and a
            button to the official announcement.
          </p>
          <p>
            <Link href="/immigration-news" className="content-links__item immigration-news-cta-strip__link">
              <strong>Browse all immigration news</strong>
              <span>Open news hub</span>
            </Link>
          </p>
        </section>

        <section className="content-section bento-hover">
          <h2>Featured planning guides</h2>
          <p>
            Use these practical guides to plan budget, timing, and document readiness before you lodge.
          </p>
          <div className="content-links">
            {latestGuides.map((guide) => (
              <Link key={guide.path} href={guide.path} className="content-links__item">
                <strong>{guide.title}</strong>
                <span>Open guide</span>
              </Link>
            ))}
          </div>
        </section>

        <NewsBoard initialNews={newsData} />
      </section>
    </SiteShell>
  );
}
