import { describe, expect, it } from "vitest";
import { buildRobotsConfig } from "../app/robots.js";

describe("buildRobotsConfig staging vs production", () => {
  it("disallows all crawlers when SITE_ENVIRONMENT=staging", () => {
    const result = buildRobotsConfig({ SITE_ENVIRONMENT: "staging" });
    expect(result.rules).toEqual([{ userAgent: "*", disallow: ["/"] }]);
    expect(result.sitemap).toBeUndefined();
  });

  it("keeps production allow rules when SITE_ENVIRONMENT is not staging", () => {
    const result = buildRobotsConfig({ SITE_ENVIRONMENT: "production" });
    expect(result.host).toBe("https://minroshmigration.com.au");
    expect(result.sitemap).toContain("sitemap.xml");
    const star = result.rules.find((r) => r.userAgent === "*");
    expect(star.allow).toContain("/");
    expect(star.disallow).toContain("/admin");
  });

  it("does not noindex production when only legacy STAGING_* flags are set", () => {
    const result = buildRobotsConfig({ STAGING_SITE: "true", STAGING_PRIVATE: "true" });
    expect(result.sitemap).toContain("sitemap.xml");
  });
});
