"use client";

import Link from "next/link";

export default function ImmigrationNewsError({ reset }) {
  return (
    <main className="loading-screen" aria-label="News loading error">
      <section className="not-found__card">
        <p className="loading-screen__eyebrow">Immigration news</p>
        <h1>Could not load this news view.</h1>
        <p>Retry now, or return to the updates hub and continue browsing other migration resources.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Retry
          </button>
          <Link href="/updates" className="btn btn-secondary">
            Go to updates
          </Link>
        </div>
      </section>
    </main>
  );
}
