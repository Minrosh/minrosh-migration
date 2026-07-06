import { describe, it, expect } from "vitest";
import { websiteCanRead, websiteCanWrite, websiteCanPublish } from "@/lib/website/permissions";

describe("website CMS permissions", () => {
  it("grants read to readonly roles", () => {
    expect(websiteCanRead("readonly")).toBe(true);
    expect(websiteCanWrite("readonly")).toBe(false);
    expect(websiteCanPublish("readonly")).toBe(false);
  });

  it("grants publish to owner and super", () => {
    expect(websiteCanPublish("owner")).toBe(true);
    expect(websiteCanPublish("super")).toBe(true);
    expect(websiteCanPublish("admin")).toBe(true);
  });

  it("denies publish to sales/support", () => {
    expect(websiteCanPublish("sales")).toBe(false);
    expect(websiteCanPublish("support")).toBe(false);
  });
});
