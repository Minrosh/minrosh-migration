"use client";

import dynamic from "next/dynamic";

/**
 * Optional deferred bundle for below-the-fold homepage sections.
 * The homepage currently imports pathway tiles and footer CTA directly; this entry remains for parity with older docs/scripts.
 */
const HomeMotionBundle = dynamic(
  () =>
    import("./home-deferred-motion-sections").then((mod) => {
      function Bundle() {
        return (
          <>
            <mod.HomeServicesPathways />
            <mod.HomeFinalCta />
          </>
        );
      }
      return { default: Bundle };
    }),
  { ssr: false, loading: () => null }
);

export function HomeDeferredMotionSectionsLazy() {
  return <HomeMotionBundle />;
}
