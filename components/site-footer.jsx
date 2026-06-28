import Link from "next/link";
import { SiteFooterInteractive } from "./site-footer-interactive";

/**
 * @param {{
 *   siteData: object,
 *   initialStats: object,
 *   chrome: import("@/lib/website/site-chrome-loader").getResolvedSiteChrome extends () => infer R ? R : never,
 *   brand: object,
 * }} props
 */
export function SiteFooter({ siteData, initialStats, chrome, brand }) {
  const publicBrand = { ...brand, email: "" };
  const contactEmailLabel = chrome.contactEmailLabel || "Email support via contact page";

  return (
    <footer className="site-footer site-footer--rich">
      <div className="site-footer__inner site-footer__inner--rich">
        <SiteFooterInteractive
          brand={publicBrand}
          initialStats={initialStats}
          footerTagline={chrome.footerTagline}
          footerSummary={chrome.footerSummary}
          contactEmailLabel={contactEmailLabel}
        >
          <>
            {chrome.footerLinkGroups.map((group) => (
              <div key={group.title} className="site-footer__nav-col">
                <strong>{group.title}</strong>
                {group.links.map((link) => (
                  <Link key={`${group.title}-${link.href}`} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </>
        </SiteFooterInteractive>
      </div>

      {chrome.showMarn && chrome.marnText ? (
        <div className="site-footer__notice-wrap">
          <div className="site-footer__notice">MARN: {chrome.marnText}</div>
        </div>
      ) : null}

      {chrome.disclaimerText ? (
        <div className="site-footer__notice-wrap">
          <div className="site-footer__notice">{chrome.disclaimerText}</div>
        </div>
      ) : null}

      <div className="site-footer__notice-wrap">
        <div className="site-footer__notice">{chrome.footerNotice}</div>
      </div>

      <div className="site-footer__legalbar">
        {chrome.legalLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
