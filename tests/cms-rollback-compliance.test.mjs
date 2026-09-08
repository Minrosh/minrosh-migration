import { describe, expect, it } from "vitest";
import {
  canRestoreSnapshotDirectlyToPublic,
  extractSnapshotTextFromHistoryEntry,
} from "../lib/cms-content-restore.js";
import { validatePublishableCopy } from "../lib/compliance.js";

/** Exact historical strings that must never go public via restore. */
const PROHIBITED_RESTORE_SNAPSHOTS = [
  "Migration Agent Brisbane",
  "MARN Available on request",
  "we assess your eligibility",
  "we lodge your visa application",
];

describe("CMS rollback / restore compliance", () => {
  it("blocks the four prohibited historical snapshots from direct public restore", () => {
    for (const snapshot of PROHIBITED_RESTORE_SNAPSHOTS) {
      expect(canRestoreSnapshotDirectlyToPublic(snapshot)).toBe(false);
      expect(validatePublishableCopy(snapshot).ok).toBe(false);
    }
  });

  it("allows neutral general-information copy", () => {
    const ok =
      "MinRosh provides general migration information from publicly available sources. We are not a registered migration agent and do not provide immigration assistance.";
    expect(canRestoreSnapshotDirectlyToPublic(ok)).toBe(true);
  });

  it("allows referral language to independent RMAs", () => {
    const referral =
      "For personalised immigration assistance, contact a registered migration agent or Australian legal practitioner. Search the official Register of Migration Agents.";
    expect(validatePublishableCopy(referral).ok).toBe(true);
  });

  it("extractSnapshotTextFromHistoryEntry concatenates content fields", () => {
    const text = extractSnapshotTextFromHistoryEntry({
      title: "Migration Agent Brisbane",
      summary: "we assess your eligibility",
      body: "we lodge your visa application",
      contentSnapshot: "MARN Available on request",
    });
    expect(text).toMatch(/Migration Agent Brisbane/);
    expect(text).toMatch(/we assess your eligibility/);
    expect(text).toMatch(/we lodge your visa application/);
    expect(text).toMatch(/MARN Available on request/);
    expect(canRestoreSnapshotDirectlyToPublic(text)).toBe(false);
  });

  it("documents restore_to_draft contract: never auto-publishes", () => {
    // Contract assertion: restore helpers only expose draft restore / validation.
    // Public publish must go through assertCanPublishNewsCopy / intelligence publish.
    for (const snapshot of PROHIBITED_RESTORE_SNAPSHOTS) {
      expect(canRestoreSnapshotDirectlyToPublic(snapshot)).toBe(false);
    }
  });
});
