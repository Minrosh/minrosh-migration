import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isWebsiteCmsEnabled } from "@/lib/website/cms-loader";
import { getLegacySiteChrome } from "@/lib/website/site-chrome-defaults";
import { getResolvedSiteChrome, resolveSiteChromeFromStores } from "@/lib/website/site-chrome-loader";
import { writeNavigationSettings } from "@/lib/website/navigation-store";
import { writeFooterSettings } from "@/lib/website/footer-store";

const envBackup = process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED;
const dataDir = path.join(process.cwd(), "data");

function navFile() {
  return path.join(dataDir, "website-navigation.json");
}

function footerFile() {
  return path.join(dataDir, "website-footer.json");
}

describe("header/footer CMS chrome fallback", () => {
  afterEach(() => {
    if (envBackup === undefined) delete process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED;
    else process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = envBackup;
    try {
      fs.unlinkSync(navFile());
    } catch {
      /* ignore */
    }
    try {
      fs.unlinkSync(footerFile());
    } catch {
      /* ignore */
    }
  });

  it("returns legacy chrome when CMS flag is off", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "false";
    expect(isWebsiteCmsEnabled()).toBe(false);
    const chrome = getResolvedSiteChrome();
    expect(chrome.fromCms).toBe(false);
    expect(chrome.primaryLinks).toEqual(getLegacySiteChrome().primaryLinks);
    expect(chrome.headerCta.label).toBe("Book consultation");
  });

  it("applies CMS nav + footer overrides when flag is on", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "true";
    writeNavigationSettings(
      {
        primaryLinks: [{ label: "CMS Home", href: "/" }],
        headerCtaLabel: "CMS Book now",
        headerCtaHref: "/book-consultation",
      },
      "vitest"
    );
    writeFooterSettings(
      {
        complianceLine: "CMS compliance notice for staging.",
        linkGroups: [
          {
            title: "CMS Services",
            links: [{ label: "CMS Contact", href: "/contact" }],
          },
        ],
        contactPhone: "0400 000 111",
      },
      "vitest"
    );
    const chrome = getResolvedSiteChrome();
    expect(chrome.fromCms).toBe(true);
    expect(chrome.primaryLinks[0].label).toBe("CMS Home");
    expect(chrome.headerCta.label).toBe("CMS Book now");
    expect(chrome.footerNotice).toContain("CMS compliance");
    expect(chrome.footerLinkGroups[0].title).toBe("CMS Services");
    expect(chrome.contactPhone).toBe("0400 000 111");
  });

  it("returns legacy chrome for corrupt navigation JSON", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "true";
    fs.writeFileSync(navFile(), "{ not-json", "utf8");
    const chrome = getResolvedSiteChrome();
    expect(chrome.primaryLinks).toEqual(getLegacySiteChrome().primaryLinks);
    expect(chrome.fromCms).toBe(false);
  });

  it("resolveSiteChromeFromStores keeps legacy fields when CMS values empty", () => {
    const chrome = resolveSiteChromeFromStores({ nav: {}, footer: {}, compliance: {} });
    expect(chrome.fromCms).toBe(false);
    expect(chrome.primaryLinks.length).toBeGreaterThan(0);
  });
});
