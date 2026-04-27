"use client";

import dynamic from "next/dynamic";

const HomeDeferredMotionSections = dynamic(
  () => import("./home-deferred-motion-sections").then((mod) => mod.HomeDeferredMotionSections),
  {
    ssr: false,
    loading: () => (
      <>
        <section className="ultra-snap-section bg-brand-plum/90" aria-hidden="true">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="h-8 w-56 rounded bg-white/20" />
            <div className="mt-6 h-[280px] rounded-3xl bg-white/10" />
          </div>
        </section>
        <section className="ultra-snap-section bg-white" aria-hidden="true">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="h-8 w-56 rounded bg-brand-plum/10" />
            <div className="mt-6 h-[280px] rounded-3xl bg-brand-cream/40" />
          </div>
        </section>
      </>
    ),
  }
);

export function HomeDeferredMotionSectionsLazy() {
  return <HomeDeferredMotionSections />;
}
