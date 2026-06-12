"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile, hide floating contact dock (WhatsApp / Ask MinRosh) while footer
 * content occupies the bottom thumb zone so footer links stay readable.
 */
export function FooterDockGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const bodyCls = "site-footer-dock-active";
    const mq = window.matchMedia("(max-width: 920px)");

    function update() {
      if (!mq.matches) {
        document.body.classList.remove(bodyCls);
        return;
      }

      const footer = document.querySelector("footer.site-footer");
      if (!footer) {
        document.body.classList.remove(bodyCls);
        return;
      }

      const legalbar = footer.querySelector(".site-footer__legalbar");
      const anchor = legalbar || footer;
      const rect = anchor.getBoundingClientRect();
      const dockTop = window.innerHeight - 240;

      document.body.classList.toggle(bodyCls, rect.top < dockTop);
    }

    update();
    const delayed = window.setTimeout(update, 2500);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    mq.addEventListener("change", update);

    return () => {
      window.clearTimeout(delayed);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
      document.body.classList.remove(bodyCls);
    };
  }, [pathname]);

  return null;
}
