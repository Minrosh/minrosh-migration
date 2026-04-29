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

export function ImmigrationNewsHub({ items }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => {
    if (activeFilter === "All") return items;
    return items.filter((item) => {
      const c = String(item.country || "").trim().toLowerCase();
      const filter = filters.find((f) => f.label === activeFilter);
      return filter ? filter.values.includes(c) : false;
    });
  }, [activeFilter, items]);

  return (
    <div className="immigration-news-hub">
      <div className="immigration-news-hub__intro">
        <p className="section-label">Immigration newsroom</p>
        <h1>Policy updates MinRosh is watching</h1>
        <p className="immigration-news-hub__lead">
          Each item opens a dedicated MinRosh note with context and a direct link to the official announcement
          where available. These pages support planning only — always confirm current rules on the department
          site before lodging.
        </p>
      </div>

      <div className="immigration-news-hub__filters" role="toolbar" aria-label="Filter news by region">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            className={`news-filter min-h-[48px] touch-manipulation ${activeFilter === f.label ? "is-active" : ""}`}
            aria-pressed={activeFilter === f.label}
            onClick={() => setActiveFilter(f.label)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="news-board__empty" role="status">
          No articles match this filter. Choose <strong>All</strong> to see every note.
        </p>
      ) : null}

      <ul className="immigration-news-hub__grid">
        {filtered.map((item) => {
          const slug = String(item.slug || "").trim();
          const href = slug ? `/immigration-news/${slug}` : String(item.href || "/updates");
          return (
            <li key={item.id || `${item.date}-${item.title}-${item.slug || ""}`}>
              <article className="immigration-news-hub__card bento-hover">
                <div className="immigration-news-hub__card-meta">
                  <span className="news-card__country">{item.country}</span>
                  <time dateTime={item.date}>{item.date}</time>
                </div>
                <h2 className="immigration-news-hub__card-title">{item.title}</h2>
                <p className="immigration-news-hub__card-summary">{item.summary}</p>
                <div className="immigration-news-hub__card-actions">
                  <Link
                    href={href}
                    className="btn btn-primary immigration-news-hub__btn min-h-[48px] touch-manipulation"
                  >
                    Open MinRosh note
                  </Link>
                  {item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      className="btn btn-ghost immigration-news-hub__btn min-h-[48px] touch-manipulation"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Official source
                    </a>
                  ) : null}
                </div>
                {item.source ? <p className="immigration-news-hub__card-source">Official body: {item.source}</p> : null}
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
