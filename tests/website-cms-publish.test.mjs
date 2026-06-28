import { describe, it, expect } from "vitest";
import {
  saveWebsitePageDraft,
  publishWebsitePage,
  applyWebsitePageSnapshot,
  listWebsitePagesForAdmin,
} from "@/lib/website/pages-store";
import { listWebsiteVersions } from "@/lib/website/version-store";

describe("website CMS publish and rollback", () => {
  it("publishes draft and records version history", () => {
    saveWebsitePageDraft("/about", {
      pageTitle: "About",
      sections: [
        {
          id: "hero-1",
          type: "hero",
          props: {
            heading: "About us",
            subheading: "Brisbane team",
            primaryCta: { text: "Contact", href: "/contact" },
            secondaryCta: { text: "", href: "" },
          },
        },
      ],
      seo: { title: "About", description: "About MinRosh" },
      updatedBy: "vitest",
    });

    const published = publishWebsitePage("/about", { publishedBy: "vitest" });
    expect(published.status).toBe("published");
    expect(published.published.sections[0].props.heading).toBe("About us");

    const versions = listWebsiteVersions("/about");
    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0].snapshot.published.sections[0].props.heading).toBe("About us");
  });

  it("restores version snapshot to draft", () => {
    saveWebsitePageDraft("/about", {
      pageTitle: "About",
      sections: [
        {
          id: "hero-1",
          type: "hero",
          props: {
            heading: "Version A",
            subheading: "",
            primaryCta: { text: "", href: "" },
            secondaryCta: { text: "", href: "" },
          },
        },
      ],
      seo: {},
      updatedBy: "vitest",
    });
    publishWebsitePage("/about", { publishedBy: "vitest" });
    const version = listWebsiteVersions("/about")[0];

    saveWebsitePageDraft("/about", {
      pageTitle: "About",
      sections: [
        {
          id: "hero-1",
          type: "hero",
          props: {
            heading: "Version B",
            subheading: "",
            primaryCta: { text: "", href: "" },
            secondaryCta: { text: "", href: "" },
          },
        },
      ],
      seo: {},
      updatedBy: "vitest",
    });

    applyWebsitePageSnapshot("/about", version.snapshot, { target: "draft", updatedBy: "vitest" });
    const listed = listWebsitePagesForAdmin();
    const about = listed.pages.find((p) => p.slug === "/about");
    expect(about?.draft?.sections?.[0]?.props?.heading).toBe("Version A");
  });
});
