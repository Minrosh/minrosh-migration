"use client";

import { usePathname } from "next/navigation";
import { GlobalClientWidgetsLazy } from "@/components/global-client-widgets-lazy";
import { FooterDockGuard } from "@/components/footer-dock-guard";
import { RouteLoadingDismiss } from "@/components/route-loading-dismiss";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Public marketing widgets (concierge, analytics, footer dock) must not mount on /admin —
 * they depend on public layout/footer and can block or confuse the admin workspace.
 */
export function PublicSiteWidgetsGate({ siteData }) {
  const pathname = usePathname() || "";

  if (isAdminPath(pathname)) {
    return <RouteLoadingDismiss />;
  }

  return (
    <>
      <RouteLoadingDismiss />
      <FooterDockGuard />
      <GlobalClientWidgetsLazy siteData={siteData} />
    </>
  );
}
