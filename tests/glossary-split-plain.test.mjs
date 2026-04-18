import { describe, expect, it } from "vitest";
import { buildGlossaryParts } from "../lib/glossary-split-plain.js";

describe("buildGlossaryParts", () => {
  it("leaves unrelated text unchanged", () => {
    const parts = buildGlossaryParts("Hello world");
    expect(parts).toEqual([{ type: "text", text: "Hello world" }]);
  });

  it("wraps multi-word glossary phrases", () => {
    const parts = buildGlossaryParts("Submit an Expression of Interest first.");
    const term = parts.find((p) => p.type === "term");
    expect(term?.text).toMatch(/Expression of Interest/i);
    expect(term?.definition).toBeTruthy();
  });

  it("does not match short codes inside longer words", () => {
    const parts = buildGlossaryParts("prepare your documents");
    expect(parts.every((p) => p.type === "text")).toBe(true);
  });

  it("matches standalone subclass codes with boundaries", () => {
    const parts = buildGlossaryParts("Compare 189 and 190 pathways.");
    const terms = parts.filter((p) => p.type === "term").map((p) => p.text);
    expect(terms).toContain("189");
    expect(terms).toContain("190");
  });
});
