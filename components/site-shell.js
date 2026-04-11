import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { SiteTopbar } from "./site-topbar";
import { SiteFooter } from "./site-footer";
import { SiteHeaderNav } from "./site-header-nav";
import { getFooterStats } from "../lib/site-stats";
import { getDestinationNavLinks } from "../lib/destination-nav";
import { GLOBAL_HEADER_PRIMARY_LINKS } from "../lib/public-indexable-routes";

const globalPrimaryLinks = GLOBAL_HEADER_PRIMARY_LINKS;

/**
 * @param {object} props
 * @param {{ slug: string, name: string } | null} [props.destinationContext] — when set, primary nav targets /destinations/[slug]/…
 * @param {"au" | "neutral"} [props.headerBackdrop] — Australia-style hero vs neutral header image
 */
export function SiteShell({
  siteData,
  currentPath,
  children,
  destinationContext = null,
  headerBackdrop = "au",
}) {
  const footerStats = getFooterStats();
  const navLinks = destinationContext
    ? getDestinationNavLinks(destinationContext.slug)
    : globalPrimaryLinks;
  const brandHref = "/";
  const brandAria = "Go to MinRosh homepage";

  const backdropModifier =
    headerBackdrop === "neutral" ? "site-header--backdrop-neutral" : "site-header--backdrop-au";

  return (
    <div className="portal-shell">
      <SiteTopbar siteData={siteData} />
      <header className={`site-header site-header--backdrop ${backdropModifier}`}>
        <div className="site-header__inner">
          <Link href={brandHref} className="brand" aria-label={brandAria}>
            <span className="brand__mark" aria-hidden="true">
              <PublicFileImg
                src="/images/minrosh-logo.jpg"
                alt=""
                width={46}
                height={46}
                priority
              />
            </span>
            <span className="brand__text">
              <strong>{siteData.brand.name}</strong>
            </span>
          </Link>
          <SiteHeaderNav navLinks={navLinks} currentPath={currentPath} />
        </div>
      </header>

      <main id="main-content" className="portal-main">{children}</main>
      <SiteFooter siteData={siteData} initialStats={footerStats} />
    </div>
  );
}
