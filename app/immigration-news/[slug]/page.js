import Link from "next/link";
import { notFound } from "next/navigation";
import siteDataStatic from "../../../data/site.json";
import { SiteShell } from "../../../components/site-shell";
import { StructuredData } from "../../../components/structured-data";
import { NewsArticleProse } from "../../../components/immigration-news/news-article-prose";
import { getHomeSiteData } from "../../../lib/home-site-data";
import { getNewsArticleBySlug } from "../../../lib/news-data";
import { NEWS_PUBLIC_BASE } from "../../../lib/news-store";
import { buildMetadata, breadcrumbJsonLd } from "../../../lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getNewsArticleBySlug(slug);
  if (!article) {
    return buildMetadata({
      title: "News not found | MinRosh Migration",
      description: "This news note could not be found.",
      path: `${NEWS_PUBLIC_BASE}/${slug}`,
    });
  }
  return buildMetadata({
    title: `${article.title} | MinRosh Migration`,
    description: String(article.summary || "").slice(0, 160),
    path: `${NEWS_PUBLIC_BASE}/${slug}`,
  });
}

export default async function ImmigrationNewsArticlePage({ params }) {
  const { slug } = await params;
  const article = getNewsArticleBySlug(slug);
  if (!article) notFound();

  const siteData = getHomeSiteData(siteDataStatic);
  const path = `${NEWS_PUBLIC_BASE}/${slug}`;

  return (
    <SiteShell siteData={siteData} currentPath={path} headerBackdrop="neutral">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Immigration news", path: "/immigration-news" },
          { name: article.title, path },
        ])}
      />
      <article className="content-page immigration-news-article">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>
            <Link href="/">Home</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>
            <Link href="/immigration-news">Immigration news</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>{article.date}</span>
        </nav>

        <header className="immigration-news-article__hero">
          <p className="section-label">{article.country}</p>
          <h1>{article.title}</h1>
          <p className="immigration-news-article__deck">{article.summary}</p>
          <div className="immigration-news-article__actions">
            {article.sourceUrl ? (
              <a
                href={article.sourceUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noreferrer noopener"
              >
                Open official announcement
              </a>
            ) : null}
            <Link href="/book-consultation" className="btn btn-ghost">
              Book a consultation
            </Link>
            <Link href="/immigration-news" className="btn btn-ghost">
              All news
            </Link>
          </div>
          {article.source ? (
            <p className="immigration-news-article__source-line">Official body referenced: {article.source}</p>
          ) : null}
        </header>

        <div className="immigration-news-article__body-wrap bento-hover">
          <NewsArticleProse text={article.body || article.summary} />
        </div>

        <aside className="immigration-news-article__aside" role="note">
          <p>
            MinRosh Migration is a registered migration practice in Australia. These notes summarise public
            information for orientation only and are not legal advice. Always verify eligibility, dates, and
            requirements on the official source before you act.
          </p>
        </aside>
      </article>
    </SiteShell>
  );
}
