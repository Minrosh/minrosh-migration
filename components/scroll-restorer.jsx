"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ScrollRestorerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Scroll smoothly to top on path or search param changes (e.g., tab switches)
    // for a more premium feel and better visual structure.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname, searchParams]);

  return null;
}

export function ScrollRestorer() {
  return (
    <Suspense fallback={null}>
      <ScrollRestorerInner />
    </Suspense>
  );
}
