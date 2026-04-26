"use client";

import dynamic from "next/dynamic";

const HomeDeferredCarousels = dynamic(
  () => import("./home-deferred-carousels").then((mod) => mod.HomeDeferredCarousels),
  {
    ssr: false,
    loading: () => (
      <>
        <section className="ultra-snap-section bg-brand-cream/30" aria-hidden="true">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="h-8 w-56 rounded bg-brand-plum/10" />
            <div className="mt-6 h-[240px] rounded-3xl bg-white/70" />
          </div>
        </section>
        <section className="ultra-snap-section bg-white" aria-hidden="true">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="h-8 w-56 rounded bg-brand-plum/10" />
            <div className="mt-6 h-[240px] rounded-3xl bg-brand-cream/40" />
          </div>
        </section>
      </>
    ),
  }
);

export function HomeDeferredCarouselsLazy({ newsItems }) {
  return <HomeDeferredCarousels newsItems={newsItems} />;
}
