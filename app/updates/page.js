import Link from "next/link";
import siteDataStatic from "../../data/site.json";
import seoPages from "../../data/seo-pages.json";
import { PublicFileImg } from "../../components/public-file-img";
import newsData from "../../data/news.json";
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

export default function UpdatesPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const latestGuides = [
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
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>
            <Link href="/">Home</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>Visa Updates</span>
        </nav>
        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">{pageData.sectionLabel}</p>
              <h1>{pageData.headline}</h1>
              <p>{pageData.intro}</p>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/brisbane-skyline.jpg"
                alt="Brisbane skyline and riverfront"
                width={1600}
                height={900}
              />
            </div>
          </div>
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
