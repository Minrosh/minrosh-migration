import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getAdminSessionSigningSecret } from "../lib/admin/session.js";

describe("getAdminSessionSigningSecret", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_PASSWORD;
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = prev.ADMIN_SESSION_SECRET;
    process.env.ADMIN_PASSWORD = prev.ADMIN_PASSWORD;
  });

  it("uses only ADMIN_SESSION_SECRET (not password)", () => {
    process.env.ADMIN_SESSION_SECRET = "  abc-secret  ";
    process.env.ADMIN_PASSWORD = "should-not-be-used";
    expect(getAdminSessionSigningSecret()).toBe("abc-secret");
  });

  it("returns empty string when secret unset", () => {
    expect(getAdminSessionSigningSecret()).toBe("");
  });
});
