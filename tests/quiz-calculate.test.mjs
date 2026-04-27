import { describe, expect, it } from "vitest";
import {
  calculateQuizResult,
  prioritySectorIllustrativeBonus,
  REGIONAL_PATHWAY_ILLUSTRATIVE_BONUS,
} from "../lib/quiz.js";

const validForm = {
  age: "25-32",
  english: "superior",
  overseasExperience: "3-4",
  australianSkilled: "1y",
  skillsReadiness: "positive",
  education: "bachelor",
  partner: "single",
  occupation: "yes",
  pathwayFocus: "independent",
  occupationSector: "other",
  sidStream: "core_skills",
  hybridCapability: "mixed",
  occupationName: "Software engineer",
};

describe("prioritySectorIllustrativeBonus", () => {
  it("returns 12 for green-tier sectors", () => {
    expect(prioritySectorIllustrativeBonus("healthcare")).toBe(12);
    expect(prioritySectorIllustrativeBonus("teaching")).toBe(12);
    expect(prioritySectorIllustrativeBonus("construction_trades")).toBe(12);
  });

  it("returns 9 for digital-tier sectors", () => {
    expect(prioritySectorIllustrativeBonus("cybersecurity")).toBe(9);
    expect(prioritySectorIllustrativeBonus("digital_it")).toBe(9);
  });

  it("returns 0 for other", () => {
    expect(prioritySectorIllustrativeBonus("other")).toBe(0);
  });
});

describe("calculateQuizResult", () => {
  it("returns null when a required option is missing", () => {
    expect(calculateQuizResult({ ...validForm, age: "invalid" })).toBeNull();
  });

  it("scores restricted age band as zero base with messaging", () => {
    const r = calculateQuizResult({ ...validForm, age: "45+" });
    expect(r).not.toBeNull();
    expect(r.restricted).toBe(true);
    expect(r.score).toBe(0);
    expect(r.messages.some((m) => /45\+/i.test(m) || /restricted/i.test(m))).toBe(true);
  });

  it("adds regional illustrative bonus when pathway is regional", () => {
    const base = calculateQuizResult({ ...validForm, pathwayFocus: "independent" });
    const regional = calculateQuizResult({ ...validForm, pathwayFocus: "regional" });
    expect(base).not.toBeNull();
    expect(regional).not.toBeNull();
    expect(regional.score - base.score).toBe(REGIONAL_PATHWAY_ILLUSTRATIVE_BONUS);
  });

  it("adds priority sector bonus for healthcare", () => {
    const plain = calculateQuizResult({ ...validForm, occupationSector: "other" });
    const health = calculateQuizResult({ ...validForm, occupationSector: "healthcare" });
    expect(plain).not.toBeNull();
    expect(health).not.toBeNull();
    expect(health.score - plain.score).toBe(12);
  });
});
