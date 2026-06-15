import { describe, expect, it } from "vitest";
import { classifyChangedFile, summarizeZoneChanges } from "../lib/zone-manifest.mjs";

describe("zone-manifest", () => {
  it("classifies admin routes and feature components", () => {
    expect(classifyChangedFile("app/admin/(secure)/page.js")).toBe("admin");
    expect(classifyChangedFile("features/admin-panel/components/admin-shell.jsx")).toBe("admin");
    expect(classifyChangedFile("components/admin/admin-shell.jsx")).toBe("admin");
    expect(classifyChangedFile("lib/admin/session-signed-cookie.js")).toBe("admin");
  });

  it("classifies public routes and marketing components", () => {
    expect(classifyChangedFile("app/contact/page.js")).toBe("public");
    expect(classifyChangedFile("components/home/home-hero-premium.jsx")).toBe("public");
    expect(classifyChangedFile("features/public-site/components/public-site-widgets-gate.jsx")).toBe(
      "public",
    );
    expect(classifyChangedFile("app/page.js")).toBe("public");
  });

  it("classifies shared framework files", () => {
    expect(classifyChangedFile("middleware.js")).toBe("shared");
    expect(classifyChangedFile("app/layout.js")).toBe("shared");
    expect(classifyChangedFile("lib/csp/build-csp-header.js")).toBe("shared");
    expect(classifyChangedFile("components/ui/button.jsx")).toBe("shared");
  });

  it("buckets unknown files separately", () => {
    const buckets = summarizeZoneChanges(["random-root-file.txt", "middleware.js"]);
    expect(buckets.unknown).toContain("random-root-file.txt");
    expect(buckets.shared).toContain("middleware.js");
  });
});
