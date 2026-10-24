import { describe, expect, it } from "vitest";
import { buildMetadata, titleWithoutBrandSuffix } from "../lib/seo.js";
import {
  buildPublicSitemapRoutes,
  newsContentLastModified,
  staticSitemapEntry,
} from "../lib/public-indexable-routes.js";

describe("document titles", () => {
  it("strips a brand suffix that the root title template will add again", () => {
    expect(titleWithoutBrandSuffix("Information and Education Support | MinRosh Migration")).toBe(
      "Information and Education Support"
    );
    const meta = buildMetadata({
      title: "Information and Education Support | MinRosh Migration",
      description: "Browse general information about Australian visa categories.",
      path: "/visa-services",
    });
    expect(meta.title).toBe("Information and Education Support");
    expect(meta.openGraph.title).toBe("Information and Education Support | MinRosh Migration");
    expect(meta.twitter.title).toBe("Information and Education Support | MinRosh Migration");
    expect(meta.alternates.canonical).toBe("/visa-services");
  });

  it("keeps a brand-first title absolute so the root template does not append the brand again", () => {
    const meta = buildMetadata({
      title: "MinRosh Migration | General Migration Information & Education Support",
      description: "Explore general Australian migration information.",
      path: "/",
    });
    expect(meta.title).toEqual({
      absolute: "MinRosh Migration | General Migration Information & Education Support",
    });
    expect(meta.openGraph.title).toBe("MinRosh Migration | General Migration Information & Education Support");
    expect(meta.twitter.title).toBe("MinRosh Migration | General Migration Information & Education Support");
  });

  it("drops a short MinRosh stub so the template can add the full brand once", () => {
    expect(titleWithoutBrandSuffix("Canada partner & family immigration | MinRosh")).toBe(
      "Canada partner & family immigration"
    );
    const meta = buildMetadata({
      title: "Australia skilled migration | 189, 190, 491 categories | MinRosh",
      description: "General information about points-tested skilled categories.",
      path: "/destinations/australia/skilled",
    });
    expect(meta.title).toBe("Australia skilled migration | 189, 190, 491 categories");
    expect(meta.openGraph.title).toBe(
      "Australia skilled migration | 189, 190, 491 categories | MinRosh Migration"
    );
  });

  it("does not append the brand again when the title already names MinRosh Migration mid-sentence", () => {
    const meta = buildMetadata({
      title: "About MinRosh Migration | Information & Education Support",
      description: "How MinRosh presents public migration and education information.",
      path: "/about",
    });
    expect(meta.title).toEqual({
      absolute: "About MinRosh Migration | Information & Education Support",
    });
    expect(meta.openGraph.title).toBe("About MinRosh Migration | Information & Education Support");
  });

  it("leaves titles that do not already include the brand unchanged", () => {
    const meta = buildMetadata({
      title: "Skilled Migration Australia 189/190/491",
      description: "General information about skilled migration categories.",
      path: "/skilled-migration",
    });
    expect(meta.title).toBe("Skilled Migration Australia 189/190/491");
    expect(meta.openGraph.title).toBe("Skilled Migration Australia 189/190/491 | MinRosh Migration");
  });
});

describe("public sitemap routes", () => {
  it("includes the public visa services page", () => {
    expect(buildPublicSitemapRoutes({}).includes("/visa-services")).toBe(true);
    expect(buildPublicSitemapRoutes({}).includes("/global-pathways")).toBe(true);
  });

  it("does not stamp static routes with the current time", () => {
    const entry = staticSitemapEntry("/skilled-migration");
    expect(entry).not.toHaveProperty("lastModified");
    expect(entry.url).toBe("https://minroshmigration.com.au/skilled-migration");
    expect(entry.changeFrequency).toBe("weekly");
  });

  it("uses a news item date and omits an invalid one", () => {
    const dated = newsContentLastModified({ date: "2026-03-01", updatedAt: "2026-04-02" });
    expect(dated?.toISOString().slice(0, 10)).toBe("2026-04-02");
    expect(newsContentLastModified({ date: "not-a-date" })).toBeNull();
    expect(newsContentLastModified({})).toBeNull();
  });
});
