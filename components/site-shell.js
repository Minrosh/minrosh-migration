import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "./site-footer";
import { SiteHeaderNav } from "./site-header-nav";
import { SitePublicStickyHeader } from "./site-public-sticky-header";
import { SiteHeaderMobileUtilities } from "./site-header-mobile-utilities";
import { SiteMobileTabBar } from "./site-mobile-tab-bar";
import { getFooterStats } from "../lib/site-stats";
import { getDestinationNavLinks } from "../lib/destination-nav";
import { GLOBAL_HEADER_PRIMARY_LINKS } from "../lib/public-indexable-routes";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "../lib/whatsapp-prefill";
import { MarketingHeadExtras } from "./marketing-head-extras";

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
  headerBackdrop: initialHeaderBackdrop = "au",
}) {
  const footerStats = getFooterStats();
  const primaryWhatsAppUrl = buildWhatsAppUrl(siteData.brand.whatsapp, WHATSAPP_LEAD_MESSAGE);
  const publicBrand = { ...siteData.brand, email: "" };
  const navLinks = destinationContext
    ? getDestinationNavLinks(destinationContext.slug)
    : globalPrimaryLinks;
  const brandHref = "/";
  const brandAria = "Go to MinRosh homepage";

  const isPremiumHome = currentPath === "/";
  const headerBackdrop = isPremiumHome ? "none" : initialHeaderBackdrop;

  const backdropModifier =
    headerBackdrop === "neutral"
      ? "site-header--backdrop-neutral"
      : headerBackdrop === "none"
        ? "site-header--backdrop-none"
        : "site-header--backdrop-au";

  return (
    <>
      <MarketingHeadExtras siteData={siteData} />
      <div
        className={`portal-shell portal-shell--mobile-tab-bar${isPremiumHome ? " portal-shell--premium-home" : ""}`}
      >
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
              <Image
                src="/images/minrosh-logo.v2.webp"
                alt="MinRosh Migration logo"
                width={60}
                height={60}
                priority={!isPremiumHome}
                {...(isPremiumHome ? {} : { fetchPriority: "high" })}
                sizes="(max-width: 720px) 44px, 52px"
              />
            </span>
            <span className="brand__text">
              <strong className="brand__name text-brand-plum">
                {siteData.brand.name}
              </strong>
              {isPremiumHome ? (
                <span className="brand__tagline">
                  Your Pathway. Our Guidance. Your Future.
                </span>
              ) : null}
            </span>
          </Link>
          <SiteHeaderNav
            navLinks={navLinks}
            currentPath={currentPath}
            enableVisaMega={!destinationContext}
          />
        </div>
        <SiteHeaderMobileUtilities brand={publicBrand} whatsappHref={primaryWhatsAppUrl} />
      </SitePublicStickyHeader>

      <main id="main-content" className="portal-main portal-main--immersive">
        {children}
      </main>
      <SiteFooter siteData={siteData} initialStats={footerStats} />
      <SiteMobileTabBar />
    </div>
    </>
  );
}
