"use client";

import dynamic from "next/dynamic";

function BelowFoldSkeleton() {
  return (
    <div aria-hidden className="space-y-12 py-8">
      <div className="h-48 rounded-3xl bg-brand-plum/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-brand-cream/80" />
        ))}
      </div>
      <div className="h-56 rounded-3xl bg-white/80" />
      <div className="h-40 rounded-3xl bg-brand-plum/5" />
    </div>
  );
}

const HomeBelowFold = dynamic(
  () => import("./home-below-fold").then((mod) => mod.HomeBelowFold),
  { loading: () => <BelowFoldSkeleton /> }
);

export function HomeBelowFoldLazy({ countries, newsItems }) {
  return <HomeBelowFold countries={countries} newsItems={newsItems} />;
}
