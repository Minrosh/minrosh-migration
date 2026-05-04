"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <main id="main-content" className="loading-screen" aria-label="Page error">
      <section className="not-found__card">
        <p className="loading-screen__eyebrow">MinRosh Migration</p>
        <h1>This page could not be loaded.</h1>
        <p>
          A temporary problem interrupted this view. You can retry now or navigate to a stable page while we recover.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
