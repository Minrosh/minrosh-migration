"use client";

import Link from "next/link";
import { useState } from "react";

export function CountryCoverage({ countries }) {
  const keys = Object.keys(countries);
  const [activeKey, setActiveKey] = useState(keys[0]);
  const current = countries[activeKey];

  return (
    <section className="country-coverage">
      <div className="section-head">
        <div>
          <p className="section-label">Countries We Cover</p>
          <h2>Advice pathways for four major destination systems</h2>
        </div>
      </div>

      <div className="country-tabs">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className={`country-tab ${activeKey === key ? "is-active" : ""}`}
            onClick={() => setActiveKey(key)}
          >
            {countries[key].title}
          </button>
        ))}
      </div>

      <article className="country-panel bento-hover">
        <h3>{current.title}</h3>
        <p>{current.copy}</p>
        <ul className="feature-list">
          {current.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {current.hubHref ? (
          <p className="country-panel__hub">
            <Link href={current.hubHref}>Open {current.title} migration hub</Link>
          </p>
        ) : null}
      </article>
    </section>
  );
}
