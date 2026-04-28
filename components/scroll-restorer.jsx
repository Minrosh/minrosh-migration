"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ScrollRestorerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.toString() || "";

  useEffect(() => {
    // Reset scroll only when route/search actually changes.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, query]);

  return null;
}

export function ScrollRestorer() {
  return (
    <Suspense fallback={null}>
      <ScrollRestorerInner />
    </Suspense>
  );
}
