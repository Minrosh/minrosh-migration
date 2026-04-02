"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const filters = ["All", "Australia", "Canada", "United Kingdom", "New Zealand"];

export function NewsBoard({ initialNews = [], limit, compact = false, showHeader = true }) {
  const [items, setItems] = useState(initialNews);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const response = await fetch("/api/news", { headers: { Accept: "application/json" } });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data)) {
          setItems(data);
        }
      } catch {
        // Keep server-provided fallback data if the API is temporarily unavailable.
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const source =
      activeFilter === "All"
        ? items
        : items.filter((item) => item.country?.toLowerCase() === activeFilter.toLowerCase());

    return typeof limit === "number" ? source.slice(0, limit) : source;
  }, [activeFilter, items, limit]);

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
                key={filter}
                type="button"
                className={`news-filter ${activeFilter === filter ? "is-active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="news-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`news-filter ${activeFilter === filter ? "is-active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      <div className="news-grid">
        {filteredItems.map((item) => (
          <article key={`${item.title}-${item.date}`} className="news-card bento-hover">
            <div className="news-card__meta">
              <span className="news-card__country">{item.country}</span>
              <time dateTime={item.date}>{new Date(item.date).toLocaleDateString("en-AU")}</time>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="news-card__actions">
              <Link href={item.href} className="text-button">
                Read MinRosh guide
              </Link>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-button">
                Official source
              </a>
            </div>
            <p className="news-card__source">{item.source}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
