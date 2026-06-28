import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import { getWebsitePagesFile } from "@/lib/website/cms-data-paths";
import { getPageForRender, isWebsiteCmsEnabled } from "@/lib/website/cms-loader";
import { publishWebsitePage, saveWebsitePageDraft } from "@/lib/website/pages-store";

const envBackup = process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED;
const SLUG = "/contact";

describe("contact CMS route fallback", () => {
  afterEach(() => {
    if (envBackup === undefined) delete process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED;
    else process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = envBackup;
  });

  it("returns null when CMS flag is off (legacy fallback)", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "false";
    expect(isWebsiteCmsEnabled()).toBe(false);
    expect(getPageForRender(SLUG)).toBeNull();
  });

  it("returns published sections when CMS flag is on and page is published", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "true";
    saveWebsitePageDraft(SLUG, {
      pageTitle: "Contact",
      sections: [
        {
          id: "hero-contact",
          type: "hero",
          props: {
            heading: "CMS Contact heading",
            subheading: "From Website Manager",
            primaryCta: { text: "Book", href: "/book-consultation" },
            secondaryCta: { text: "", href: "" },
          },
        },
      ],
      seo: {},
      updatedBy: "vitest",
    });
    publishWebsitePage(SLUG, { publishedBy: "vitest" });
    const rendered = getPageForRender(SLUG);
    expect(rendered?.sections?.[0]?.props?.heading).toBe("CMS Contact heading");
  });

  it("returns null for corrupt website-pages.json (legacy fallback)", () => {
    process.env.NEXT_PUBLIC_WEBSITE_CMS_ENABLED = "true";
    fs.writeFileSync(getWebsitePagesFile(), "{ not-valid-json", "utf8");
    expect(getPageForRender(SLUG)).toBeNull();
  });
});
