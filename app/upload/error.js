"use client";

import Link from "next/link";

export default function UploadError({ reset }) {
  return (
    <main id="main-content" className="loading-screen" aria-label="Upload portal error">
      <section className="not-found__card">
        <p className="loading-screen__eyebrow">Secure upload</p>
        <h1>Unable to open the upload portal.</h1>
        <p>Your link may still be valid. Retry now, or request a fresh upload link from our team.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Retry
          </button>
          <Link href="/contact" className="btn btn-secondary">
            Request help
          </Link>
        </div>
      </section>
    </main>
  );
}
