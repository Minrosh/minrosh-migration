"use client";

import Link from "next/link";

export default function DestinationsError({ reset }) {
  return (
    <main id="main-content" className="loading-screen" aria-label="Destination content error">
      <section className="not-found__card">
        <p className="loading-screen__eyebrow">Global pathways</p>
        <h1>Destination details are temporarily unavailable.</h1>
        <p>Please retry, or go to the broader pathways page while destination data reloads.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Retry
          </button>
          <Link href="/global-pathways" className="btn btn-secondary">
            View global pathways
          </Link>
        </div>
      </section>
    </main>
  );
}
