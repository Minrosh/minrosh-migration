"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { minRoshGuideHref } from "@/lib/news-display";

const filters = [
  { label: "All", values: ["all"] },
  { label: "Australia", values: ["australia"] },
  { label: "Canada", values: ["canada"] },
  { label: "UK", values: ["uk", "united kingdom"] },
  { label: "New Zealand", values: ["new zealand"] },
];

/** Normalize href from JSON; return shape for Link vs external anchor. */
function resolveHref(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return { href: s, external: true };
  if (/^(mailto:|tel:)/i.test(s)) return { href: s, external: false };
  const path = s.startsWith("/") || s.startsWith("#") ? s : `/${s.replace(/^\/+/, "")}`;
  return { href: path, external: false };
}

function stopCarouselCapture(e) {
  e.stopPropagation();
}

function NewsBriefingLink({ item, index }) {
  const g = resolveHref(minRoshGuideHref(item, index));
  if (!g) return null;
  const className = "news-card__link";
  if (g.external) {
    return (
      <a
        href={g.href}
        className={className}
        target="_blank"
        rel="noreferrer noopener"
        onPointerDown={stopCarouselCapture}
        onMouseDown={stopCarouselCapture}
      >
        Read briefing
      </a>
    );
  }
  return (
    <Link
      href={g.href}
      className={className}
      scroll
      onPointerDown={stopCarouselCapture}
      onMouseDown={stopCarouselCapture}
    >
      Read briefing
    </Link>
  );
}

export function NewsBoard({
  initialNews = [],
  limit,
  compact = false,
  showHeader = true,
  carousel = false,
}) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredItems = useMemo(() => {
    const source =
      activeFilter === "All"
        ? initialNews
        : initialNews.filter((item) => {
            const normalizedCountry = String(item.country || "").trim().toLowerCase();
            const filter = filters.find((entry) => entry.label === activeFilter);
            return filter ? filter.values.includes(normalizedCountry) : false;
          });

    return typeof limit === "number" ? source.slice(0, limit) : source;
  }, [activeFilter, initialNews, limit]);

  const filterButtons = (
    <div className="news-filters" role="toolbar" aria-label="Filter news by region">
      {filters.map((filter) => (
        <button
          key={filter.label}
          type="button"
          className={`news-filter ${activeFilter === filter.label ? "is-active" : ""}`}
          aria-pressed={activeFilter === filter.label}
          onClick={() => setActiveFilter(filter.label)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );

  const newsArticles = filteredItems.map((item, idx) => (
    <article
      key={item.id || `${item.date}-${item.title}-${idx}`}
      className={`news-card bento-hover${carousel ? " news-card--carousel" : ""}`}
    >
      <div className="news-card__meta">
        <span className="news-card__country">{item.country}</span>
        <time dateTime={item.date}>{item.date}</time>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="news-card__actions">
        <NewsBriefingLink item={item} index={idx} />
        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            className="news-card__link news-card__link--secondary"
            target="_blank"
            rel="noreferrer noopener"
            onPointerDown={stopCarouselCapture}
            onMouseDown={stopCarouselCapture}
          >
            Official announcement
          </a>
        ) : null}
      </div>
      {item.source ? <p className="news-card__source">Official body: {item.source}</p> : null}
    </article>
  ));

  return (
    <section className={`news-board ${compact ? "news-board--compact" : ""}`} aria-labelledby="news-board-title">
      {showHeader ? (
        <div className="news-board__head">
          <div className="news-board__head-copy">
            <p className="section-label">Official Immigration News Board</p>
            <h2 id="news-board-title">Policy notes tied to primary government sources</h2>
            <p className="news-board__lead">
              Each card links to a MinRosh briefing page and, where available, the department announcement. This board
              is for orientation only — always confirm dates and criteria on the official site before you act.
            </p>
            <div className="news-board__head-actions">
              <Link href="/immigration-news" className="btn btn-primary news-board__hub-cta">
                Open full news hub
              </Link>
              <Link href="/updates" className="btn btn-ghost news-board__hub-cta">
                Visa updates hub
              </Link>
            </div>
          </div>
          {filterButtons}
        </div>
      ) : (
        filterButtons
      )}
      {filteredItems.length === 0 ? (
        <p className="news-board__empty" role="status">
          No items match this filter right now. Choose <strong>All</strong> or open the{" "}
          <Link href="/immigration-news">immigration news hub</Link> for the complete list.
        </p>
      ) : carousel ? (
        <div
          className="news-board__carousel"
          role="region"
          aria-label="Immigration news — scroll horizontally to see more"
          tabIndex={0}
        >
          <div className="news-board__carousel-track">{newsArticles}</div>
        </div>
      ) : (
        <div className="news-grid">{newsArticles}</div>
      )}
    </section>
  );
}
