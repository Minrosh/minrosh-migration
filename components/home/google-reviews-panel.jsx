"use client";

import { useEffect, useState } from "react";

function ReviewCards({ reviews, carousel }) {
  const cards = reviews.map((r, i) => (
    <article key={`${r.author_name || "review"}-${i}`} className={`faq-card bento-hover${carousel ? " review-card--carousel" : ""}`}>
      <h3>{r.author_name || "Client"}</h3>
      <p>{String(r.text || "").slice(0, 260)}</p>
    </article>
  ));

  if (carousel) {
    return (
      <div
        className="reviews-carousel"
        role="region"
        aria-label="Google reviews, scroll horizontally"
      >
        <div className="reviews-carousel__track">{cards}</div>
      </div>
    );
  }

  return <div className="faq-grid">{cards}</div>;
}

export function GoogleReviewsPanel({ carousel = false }) {
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
    const fallback = [
      {
        title: "Clear next steps",
        body: "Clients tell us they value practical guidance and predictable communication from first enquiry to lodgement prep.",
      },
      {
        title: "Responsive support",
        body: "Our Brisbane team supports Sri Lankan families, students, and skilled professionals with transparent timelines.",
      },
    ];
    const cards = fallback.map((item) => (
      <article key={item.title} className={`faq-card bento-hover${carousel ? " review-card--carousel" : ""}`}>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </article>
    ));

    return (
      <section className="editorial-section editorial-section--compact">
        <div className="section-head">
          <div>
            <p className="section-label">Client Trust</p>
            <h2>Trusted by clients across Sri Lanka and Australia</h2>
          </div>
        </div>
        {carousel ? (
          <div
            className="reviews-carousel"
            role="region"
            aria-label="Client trust highlights, scroll horizontally"
          >
            <div className="reviews-carousel__track">{cards}</div>
          </div>
        ) : (
          <div className="faq-grid">{cards}</div>
        )}
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
      <ReviewCards reviews={data.reviews} carousel={carousel} />
    </section>
  );
}
