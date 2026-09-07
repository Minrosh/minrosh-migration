import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { getSiteEnvironment, isStagingEnvironment } from "../lib/site-environment.js";
import { resolveSheetSyncStatus } from "../lib/google-sheets-crm.js";
import { applyStagingRobotsHeader, rootRobotsMetadata } from "../lib/seo-robots.js";

describe("isStagingEnvironment / SITE_ENVIRONMENT", () => {
  it("is true only when SITE_ENVIRONMENT=staging", () => {
    expect(isStagingEnvironment({ SITE_ENVIRONMENT: "staging" })).toBe(true);
    expect(isStagingEnvironment({ SITE_ENVIRONMENT: "Staging" })).toBe(true);
    expect(isStagingEnvironment({ SITE_ENVIRONMENT: " staging " })).toBe(true);
  });

  it("is false for production, empty, and legacy staging flags without SITE_ENVIRONMENT", () => {
    expect(isStagingEnvironment({ SITE_ENVIRONMENT: "production" })).toBe(false);
    expect(isStagingEnvironment({})).toBe(false);
    expect(isStagingEnvironment({ STAGING_SITE: "true" })).toBe(false);
    expect(isStagingEnvironment({ STAGING_PRIVATE: "true" })).toBe(false);
    expect(isStagingEnvironment({ NODE_ENV: "production" })).toBe(false);
  });

  it("getSiteEnvironment prefers SITE_ENVIRONMENT over NODE_ENV", () => {
    expect(getSiteEnvironment({ SITE_ENVIRONMENT: "staging", NODE_ENV: "production" })).toBe("staging");
    expect(getSiteEnvironment({ SITE_ENVIRONMENT: "production" })).toBe("production");
    expect(getSiteEnvironment({ NODE_ENV: "production" })).toBe("production");
  });
});

describe("rootRobotsMetadata / applyStagingRobotsHeader", () => {
  it("returns noindex metadata only for staging", () => {
    expect(rootRobotsMetadata({ SITE_ENVIRONMENT: "staging" }).index).toBe(false);
    expect(rootRobotsMetadata({ SITE_ENVIRONMENT: "production" }).index).toBe(true);
    expect(rootRobotsMetadata({ STAGING_SITE: "true" }).index).toBe(true);
  });

  it("sets X-Robots-Tag only for staging", () => {
    const staging = applyStagingRobotsHeader(NextResponse.next(), { SITE_ENVIRONMENT: "staging" });
    expect(staging.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    const prod = applyStagingRobotsHeader(NextResponse.next(), { SITE_ENVIRONMENT: "production" });
    expect(prod.headers.get("X-Robots-Tag")).toBeNull();
  });
});

describe("resolveSheetSyncStatus", () => {
  it("never reports success when Sheets is not configured", () => {
    expect(resolveSheetSyncStatus({ appended: false, reason: "sheets_crm_not_configured" })).toBe(
      "not_configured",
    );
    expect(resolveSheetSyncStatus({ appended: false, reason: "sheets_crm_not_configured" })).not.toBe(
      "success",
    );
    expect(resolveSheetSyncStatus({ appended: false, reason: "sheets_crm_not_configured" })).not.toBe("ok");
  });

  it("reports success only when appended is true", () => {
    expect(resolveSheetSyncStatus({ appended: true })).toBe("success");
  });

  it("reports skipped for other non-success results", () => {
    expect(resolveSheetSyncStatus({ appended: false, reason: "other" })).toBe("skipped");
    expect(resolveSheetSyncStatus(undefined)).toBe("skipped");
    expect(resolveSheetSyncStatus(null)).toBe("skipped");
  });
});
