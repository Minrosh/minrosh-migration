"use client";

import Link from "next/link";

export default function GlobalError() {
  return (
    <html lang="en-AU">
      <body>
        <main id="main-content" className="loading-screen" aria-label="Critical application error">
          <section className="not-found__card">
            <p className="loading-screen__eyebrow">MinRosh Migration</p>
            <h1>Something unexpected happened.</h1>
            <p>
              The application hit a critical issue. Please refresh the page. If this continues, use the contact page
              and we will assist immediately.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/" className="btn btn-primary">
                Go to homepage
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Contact support
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
