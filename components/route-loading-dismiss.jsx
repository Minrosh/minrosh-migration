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
    const main = document.querySelector("#main-content");
    if (main?.hasAttribute("hidden")) {
      main.removeAttribute("hidden");
    }
    document
      .querySelectorAll(".loading-screen--route-boundary")
      .forEach((node) => {
        node.style.setProperty("display", "none", "important");
        node.style.pointerEvents = "none";
        node.setAttribute("aria-hidden", "true");
      });
  }, [pathname]);

  return null;
}
