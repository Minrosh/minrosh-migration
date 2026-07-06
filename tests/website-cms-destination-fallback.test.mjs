import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import { getWebsitePagesFile } from "@/lib/website/cms-data-paths";
import { getPageForRender, isWebsiteCmsEnabled } from "@/lib/website/cms-loader";
import { publishWebsitePage, saveWebsitePageDraft } from "@/lib/website/pages-store";

const envBackup = process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED;
const SLUG = "/destinations/australia";

describe("destination hub CMS route fallback", () => {
  afterEach(() => {
    if (envBackup === undefined) delete process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED;
    else process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = envBackup;
  });

  it("returns null when CMS flag is off (legacy fallback)", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "false";
    expect(getPageForRender(SLUG)).toBeNull();
  });

  it("returns published sections when CMS flag is on and page is published", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "true";
    saveWebsitePageDraft(SLUG, {
      pageTitle: "Australia hub",
      sections: [
        {
          id: "hero-au",
          type: "hero",
          props: {
            heading: "CMS Australia hub heading",
            subheading: "From Website Manager",
            primaryCta: { text: "Contact", href: "/contact" },
            secondaryCta: { text: "", href: "" },
          },
        },
      ],
      seo: {},
      updatedBy: "vitest",
    });
    publishWebsitePage(SLUG, { publishedBy: "vitest" });
    expect(getPageForRender(SLUG)?.sections?.[0]?.props?.heading).toBe("CMS Australia hub heading");
  });

  it("returns null for corrupt website-pages.json (legacy fallback)", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "true";
    fs.writeFileSync(getWebsitePagesFile(), "{ not-valid-json", "utf8");
    expect(getPageForRender(SLUG)).toBeNull();
  });
});
