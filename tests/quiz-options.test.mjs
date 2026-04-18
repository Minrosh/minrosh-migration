import { describe, expect, it } from "vitest";
import { quizOptions } from "../lib/quiz.js";

describe("quizOptions", () => {
  it("exposes age bands", () => {
    expect(Array.isArray(quizOptions.age)).toBe(true);
    expect(quizOptions.age.length).toBeGreaterThan(0);
  });
});
