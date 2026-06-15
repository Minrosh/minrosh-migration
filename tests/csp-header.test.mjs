import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "../lib/csp/build-csp-header.js";

describe("buildContentSecurityPolicy", () => {
  it("public mode allows self and inline scripts without nonce or strict-dynamic", () => {
    const csp = buildContentSecurityPolicy(null, { production: true, mode: "public" });
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("strict-dynamic");
    expect(csp).not.toContain("nonce-");
  });

  it("admin mode uses nonce and strict-dynamic", () => {
    const csp = buildContentSecurityPolicy("abc123", { production: true, mode: "admin" });
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });
});
