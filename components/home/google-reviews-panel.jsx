"use client";

import { useEffect, useState } from "react";

export function GoogleReviewsPanel() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ reviews: [], reason: "" });

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setData(d || { reviews: [] }))
      .catch(() => setData({ reviews: [], reason: "reviews_unavailable" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="editorial-section editorial-section--compact">
        <p className="section-label">Google Reviews</p>
        <p>Loading recent reviews...</p>
      </section>
    );
  }

  if (!Array.isArray(data.reviews) || data.reviews.length === 0) {
    return (
      <section className="editorial-section editorial-section--compact">
        <div className="section-head">
          <div>
            <p className="section-label">Client Trust</p>
            <h2>Trusted by clients across Sri Lanka and Australia</h2>
          </div>
        </div>
        <div className="faq-grid">
          <article className="faq-card bento-hover">
            <h3>Clear next steps</h3>
            <p>Clients tell us they value practical guidance and predictable communication from first enquiry to lodgement prep.</p>
          </article>
          <article className="faq-card bento-hover">
            <h3>Responsive support</h3>
            <p>Our Brisbane team supports Sri Lankan families, students, and skilled professionals with transparent timelines.</p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="editorial-section editorial-section--compact">
      <div className="section-head">
        <div>
          <p className="section-label">Google Reviews</p>
          <h2>Trusted by clients across Sri Lanka and Australia</h2>
        </div>
        {data.rating ? (
          <p>
            {data.rating} ★ from {data.totalRatings || "many"} Google reviews
          </p>
        ) : null}
      </div>
      <div className="faq-grid">
        {data.reviews.map((r, i) => (
          <article key={`${r.author_name || "review"}-${i}`} className="faq-card bento-hover">
            <h3>{r.author_name || "Client"}</h3>
            <p>{String(r.text || "").slice(0, 260)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
