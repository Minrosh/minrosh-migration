"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Next.js can leave the root route loading shell in the DOM after #main-content
 * has streamed in. Remove it so the full-viewport loader does not block the site.
 */
export function RouteLoadingDismiss() {
  const pathname = usePathname();

  useEffect(() => {
    document
      .querySelectorAll(".loading-screen--route-boundary")
      .forEach((node) => node.remove());
  }, [pathname]);

  return null;
}
