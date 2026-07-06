import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { getWebsitePagesFile } from "@/lib/website/cms-data-paths";
import { saveWebsitePageDraft, listWebsitePagesForAdmin } from "@/lib/website/pages-store";

describe("website CMS pages store", () => {
  it("saves draft sections to isolated website-pages.json", () => {
    saveWebsitePageDraft("/about", {
      pageTitle: "About MinRosh",
      sections: [
        {
          id: "hero-test",
          type: "hero",
          props: {
            heading: "CMS Sprint 1 proof",
            subheading: "Draft only",
            primaryCta: { text: "Contact", href: "/contact" },
            secondaryCta: { text: "", href: "" },
          },
        },
      ],
      seo: { title: "About SEO draft", description: "Draft description" },
      updatedBy: "vitest",
    });

    const pagesFile = getWebsitePagesFile();
    expect(fs.existsSync(pagesFile)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(pagesFile, "utf8"));
    expect(raw.schemaVersion).toBe(1);
    expect(Array.isArray(raw.pages)).toBe(true);

    const listed = listWebsitePagesForAdmin();
    expect(listed.ok).toBe(true);
    const about = listed.pages.find((p) => p.slug === "/about");
    expect(about?.draft?.sections?.[0]?.props?.heading).toBe("CMS Sprint 1 proof");
    expect(about?.draft?.updatedBy).toBe("vitest");
  });
});
