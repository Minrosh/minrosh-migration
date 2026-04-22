import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { SiteFooter } from "./site-footer";
import { SiteHeaderNav } from "./site-header-nav";
import { SitePublicStickyHeader } from "./site-public-sticky-header";
import { SiteHeaderMobileUtilities } from "./site-header-mobile-utilities";
import { getFooterStats } from "../lib/site-stats";
import { getDestinationNavLinks } from "../lib/destination-nav";
import { GLOBAL_HEADER_PRIMARY_LINKS } from "../lib/public-indexable-routes";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "../lib/whatsapp-prefill";

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
  const primaryWhatsAppUrl = buildWhatsAppUrl(siteData.brand.whatsapp, WHATSAPP_LEAD_MESSAGE);
  const navLinks = destinationContext
    ? getDestinationNavLinks(destinationContext.slug)
    : globalPrimaryLinks;
  const brandHref = "/";
  const brandAria = "Go to MinRosh homepage";

  const backdropModifier =
    headerBackdrop === "neutral" ? "site-header--backdrop-neutral" : "site-header--backdrop-au";

  return (
    <div className="portal-shell">
      <SitePublicStickyHeader
        backdropModifier={backdropModifier}
        className="site-header--marketing"
      >
        <div className="site-header__inner">
          <Link
            href={brandHref}
            className="brand hover:scale-105 transition-transform duration-300"
            aria-label={brandAria}
          >
            <span className="brand__mark" aria-hidden="true">
              <PublicFileImg
                src="/images/minrosh-logo.png"
                alt=""
                width={46}
                height={46}
                priority
              />
            </span>
            <span className="brand__text">
              <strong className="brand__name text-brand-plum">
                {siteData.brand.name}
              </strong>
            </span>
          </Link>
          <SiteHeaderNav
            navLinks={navLinks}
            currentPath={currentPath}
            enableVisaMega={!destinationContext}
          />
        </div>
        <SiteHeaderMobileUtilities siteData={siteData} />
      </SitePublicStickyHeader>

      <main id="main-content" className="portal-main portal-main--immersive pt-6 md:pt-8">{children}</main>
      <SiteFooter siteData={siteData} initialStats={footerStats} />
      <div className="mobile-sticky-cta" role="region" aria-label="Quick contact actions">
        <Link href="/assessment" className="mobile-sticky-cta__action mobile-sticky-cta__action--primary">
          Free assessment
        </Link>
        <a
          href={primaryWhatsAppUrl}
          className="mobile-sticky-cta__action mobile-sticky-cta__action--secondary"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp now
        </a>
      </div>
    </div>
  );
}
