import { isWebsiteCmsEnabled } from "@/lib/website/cms-loader";
import { getComplianceSettings } from "@/lib/website/compliance-store";
import { getFooterSettings } from "@/lib/website/footer-store";
import { getNavigationSettings } from "@/lib/website/navigation-store";
import {
  getLegacySiteChrome,
  LEGACY_FOOTER_NOTICE,
  LEGACY_HEADER_CTA,
} from "@/lib/website/site-chrome-defaults";
import { GLOBAL_HEADER_PRIMARY_LINKS } from "@/lib/public-indexable-routes";

/** @param {{ label?: string, href?: string }[]} links */
function validLinks(links) {
  return (Array.isArray(links) ? links : [])
    .map((l) => ({ label: String(l?.label || "").trim(), href: String(l?.href || "").trim() }))
    .filter((l) => l.label && l.href);
}

/** @param {{ title?: string, links?: unknown[] }[]} groups */
function validLinkGroups(groups) {
  return (Array.isArray(groups) ? groups : [])
    .map((g) => ({
      title: String(g?.title || "").trim(),
      links: validLinks(g?.links),
    }))
    .filter((g) => g.title && g.links.length > 0);
}

/**
 * Merge CMS navigation/footer/compliance onto legacy chrome.
 * Empty CMS fields keep legacy values (partial override safe).
 * @param {{ nav?: object, footer?: object, compliance?: object }} stores
 */
export function resolveSiteChromeFromStores(stores = {}) {
  const legacy = getLegacySiteChrome();
  const nav = stores.nav || {};
  const footer = stores.footer || {};
  const compliance = stores.compliance || {};

  const cmsNavLinks = validLinks(nav.primaryLinks);
  const cmsGroups = validLinkGroups(footer.linkGroups);

  const headerCtaLabel = String(nav.headerCtaLabel || "").trim();
  const headerCtaHref = String(nav.headerCtaHref || "").trim();

  const footerNotice =
    String(footer.complianceLine || "").trim() ||
    String(compliance.footerComplianceWording || "").trim() ||
    legacy.footerNotice;

  const socialRaw = footer.social && typeof footer.social === "object" ? footer.social : null;
  const socialOverrides = socialRaw
    ? Object.fromEntries(
        Object.entries(socialRaw)
          .map(([k, v]) => [k, String(v || "").trim()])
          .filter(([, v]) => v)
      )
    : null;

  const hasCmsOverride =
    cmsNavLinks.length > 0 ||
    (headerCtaLabel && headerCtaHref) ||
    cmsGroups.length > 0 ||
    Boolean(String(footer.complianceLine || "").trim()) ||
    Boolean(String(compliance.footerComplianceWording || "").trim()) ||
    Boolean(String(footer.footerTagline || "").trim()) ||
    Boolean(String(footer.footerSummary || "").trim()) ||
    Boolean(String(footer.contactPhone || "").trim()) ||
    Boolean(String(footer.contactEmailLabel || "").trim()) ||
    (socialOverrides && Object.keys(socialOverrides).length > 0) ||
    Boolean(compliance.showMarn) ||
    Boolean(String(compliance.marnText || "").trim() && compliance.marnText !== legacy.marnText) ||
    Boolean(String(compliance.disclaimerText || "").trim());

  return {
    primaryLinks: cmsNavLinks.length > 0 ? cmsNavLinks : GLOBAL_HEADER_PRIMARY_LINKS,
    headerCta:
      headerCtaLabel && headerCtaHref
        ? { label: headerCtaLabel, href: headerCtaHref }
        : LEGACY_HEADER_CTA,
    footerLinkGroups: cmsGroups.length > 0 ? cmsGroups : legacy.footerLinkGroups,
    legalLinks: legacy.legalLinks,
    footerNotice: footerNotice || LEGACY_FOOTER_NOTICE,
    footerTagline: String(footer.footerTagline || "").trim() || legacy.footerTagline,
    footerSummary: String(footer.footerSummary || "").trim() || legacy.footerSummary,
    contactPhone: String(footer.contactPhone || "").trim(),
    contactEmailLabel: String(footer.contactEmailLabel || "").trim(),
    socialOverrides: socialOverrides && Object.keys(socialOverrides).length > 0 ? socialOverrides : null,
    showMarn: Boolean(compliance.showMarn),
    marnText: String(compliance.marnText || legacy.marnText).trim() || legacy.marnText,
    disclaimerText: String(compliance.disclaimerText || "").trim(),
    footerComplianceWording: String(compliance.footerComplianceWording || "").trim(),
    fromCms: hasCmsOverride,
  };
}

/**
 * Resolved header/footer chrome for public SiteShell.
 * CMS disabled, corrupt, or empty stores → full legacy chrome.
 */
export function getResolvedSiteChrome() {
  if (!isWebsiteCmsEnabled()) {
    return getLegacySiteChrome();
  }
  try {
    return resolveSiteChromeFromStores({
      nav: getNavigationSettings(),
      footer: getFooterSettings(),
      compliance: getComplianceSettings(),
    });
  } catch (err) {
    console.error("[website-cms] getResolvedSiteChrome failed:", err);
    return getLegacySiteChrome();
  }
}

/**
 * @param {import("@/data/site.json").brand} brand
 * @param {ReturnType<typeof getResolvedSiteChrome>} chrome
 */
export function mergeBrandWithChrome(brand, chrome) {
  const next = { ...brand };
  if (chrome.contactPhone) {
    next.phone = chrome.contactPhone;
  }
  if (chrome.socialOverrides) {
    next.social = { ...(brand.social || {}), ...chrome.socialOverrides };
  }
  return next;
}
