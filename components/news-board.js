"use client";

import { useMemo, useState } from "react";
import { minRoshGuideHref } from "@/lib/news-display";

const filters = [
  { label: "All", values: ["all"] },
  { label: "Australia", values: ["australia"] },
  { label: "Canada", values: ["canada"] },
  { label: "UK", values: ["uk", "united kingdom"] },
  { label: "New Zealand", values: ["new zealand"] },
];

/** Normalize href from JSON; use a real `<a>` so links work inside horizontal scroll + hash home tab. */
function guideHref(raw) {
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

function NewsGuideLink({ item, index }) {
  const g = guideHref(minRoshGuideHref(item, index));
  if (!g) return null;
  return (
    <a
      href={g.href}
      className="news-card__link"
      {...(g.external ? { target: "_blank", rel: "noreferrer" } : {})}
      onPointerDown={stopCarouselCapture}
      onMouseDown={stopCarouselCapture}
    >
      Read MinRosh guide
    </a>
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
        <NewsGuideLink item={item} index={idx} />
        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            className="news-card__link"
            target="_blank"
            rel="noreferrer noopener"
            onPointerDown={stopCarouselCapture}
            onMouseDown={stopCarouselCapture}
          >
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
