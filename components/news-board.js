"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const filters = [
  { label: "All", values: ["all"] },
  { label: "Australia", values: ["australia"] },
  { label: "Canada", values: ["canada"] },
  { label: "UK", values: ["uk", "united kingdom"] },
  { label: "New Zealand", values: ["new zealand"] },
];

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

  const newsArticles = filteredItems.map((item, idx) => (
    <article
      key={`${item.date}-${item.title}-${idx}`}
      className={`news-card bento-hover${carousel ? " news-card--carousel" : ""}`}
    >
      <div className="news-card__meta">
        <span className="news-card__country">{item.country}</span>
        <time dateTime={item.date}>{item.date}</time>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="news-card__actions">
        {item.href ? (
          <Link href={item.href} className="news-card__link">
            Read MinRosh guide
          </Link>
        ) : null}
        {item.sourceUrl ? (
          <a href={item.sourceUrl} className="news-card__link" target="_blank" rel="noreferrer">
            Official source
          </a>
        ) : null}
      </div>
      {item.source ? <p className="news-card__source">Source: {item.source}</p> : null}
    </article>
  ));

  return (
    <section className={`news-board ${compact ? "news-board--compact" : ""}`}>
      {showHeader ? (
        <div className="news-board__head">
          <div>
            <p className="section-label">Official Immigration News Board</p>
            <h2>Track updates across the migration systems MinRosh actively monitors</h2>
          </div>
          <div className="news-filters">
            {filters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={`news-filter ${activeFilter === filter.label ? "is-active" : ""}`}
                onClick={() => setActiveFilter(filter.label)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="news-filters">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={`news-filter ${activeFilter === filter.label ? "is-active" : ""}`}
              onClick={() => setActiveFilter(filter.label)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      {carousel ? (
        <div
          className="news-board__carousel"
          role="region"
          aria-label="Immigration news, scroll horizontally"
        >
          <div className="news-board__carousel-track">{newsArticles}</div>
        </div>
      ) : (
        <div className="news-grid">{newsArticles}</div>
      )}
    </section>
  );
}
