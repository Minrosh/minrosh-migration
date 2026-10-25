import { describe, expect, it } from "vitest";
import { buildRobotsConfig } from "../app/robots.js";
import { applyStagingRobotsHeader, rootRobotsMetadata } from "../lib/seo-robots.js";
import { NextResponse } from "next/server";

describe("buildRobotsConfig staging vs production", () => {
  it("disallows all crawlers when SITE_ENVIRONMENT=staging", () => {
    const result = buildRobotsConfig({ SITE_ENVIRONMENT: "staging" });
    expect(result.rules).toEqual([{ userAgent: "*", disallow: ["/"] }]);
    expect(result.sitemap).toBeUndefined();
    expect(result.host).toBeUndefined();
  });

  it("keeps production allow rules when SITE_ENVIRONMENT is production", () => {
    const result = buildRobotsConfig({ SITE_ENVIRONMENT: "production" });
    expect(result.host).toBe("https://minroshmigration.com.au");
    expect(result.sitemap).toBe("https://minroshmigration.com.au/sitemap.xml");
    const star = result.rules.find((r) => r.userAgent === "*");
    expect(star.allow).toContain("/");
    expect(star.allow).toContain("/api/reviews");
    expect(star.allow).not.toContain("/api/stats");
    expect(star.disallow).toEqual(expect.arrayContaining(["/admin", "/api", "/upload"]));
  });

  it("uses production indexing when SITE_ENVIRONMENT is unset", () => {
    const result = buildRobotsConfig({});
    expect(result.sitemap).toContain("https://minroshmigration.com.au/sitemap.xml");
    expect(result.rules.some((r) => r.userAgent === "*" && r.disallow?.includes("/"))).toBe(false);
  });

  it("does not noindex production when only legacy STAGING_* flags are set", () => {
    const result = buildRobotsConfig({ STAGING_SITE: "true", STAGING_PRIVATE: "true" });
    expect(result.sitemap).toContain("sitemap.xml");
  });
});

describe("staging vs production SEO surface (meta + header + robots)", () => {
  it("staging: noindex meta, X-Robots-Tag, and robots disallow /", () => {
    const env = { SITE_ENVIRONMENT: "staging" };
    const meta = rootRobotsMetadata(env);
    expect(meta.index).toBe(false);
    expect(meta.follow).toBe(false);
    const res = applyStagingRobotsHeader(NextResponse.next(), env);
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    const robots = buildRobotsConfig(env);
    expect(robots.rules).toEqual([{ userAgent: "*", disallow: ["/"] }]);
  });

  it("production: indexable meta, no staging header, production canonical host/sitemap", () => {
    const env = { SITE_ENVIRONMENT: "production" };
    const meta = rootRobotsMetadata(env);
    expect(meta.index).toBe(true);
    expect(meta.follow).toBe(true);
    const res = applyStagingRobotsHeader(NextResponse.next(), env);
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
    const robots = buildRobotsConfig(env);
    expect(robots.host).toBe("https://minroshmigration.com.au");
    expect(robots.sitemap).toBe("https://minroshmigration.com.au/sitemap.xml");
  });
});
