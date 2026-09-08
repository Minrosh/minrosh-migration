/**
 * CMS content restore / rollback safety for no-MARN mode.
 *
 * - Emergency rollback (`rollbackPublishedDraft`) removes public news (unpublish).
 * - Restoring historical copy always creates an intelligence **draft** and never
 *   writes to the public news store from this path.
 * - Non-compliant snapshots are still saved as drafts for review but remain blocked
 *   from publish until validatePublishableCopy passes.
 */

import { validatePublishableCopy } from "@/lib/compliance";
import { readPublishHistory } from "@/lib/intelligence/publish-history";
import { createPendingDraft, updateDraftStatus } from "@/lib/intelligence/store";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";

/**
 * @param {Record<string, unknown>} entry
 */
export function extractSnapshotTextFromHistoryEntry(entry) {
  return [
    entry.title,
    entry.newsTitle,
    entry.headline,
    entry.summary,
    entry.seoDescription,
    entry.body,
    entry.contentSnapshot,
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Restore a publish-history entry to an intelligence draft only.
 * Never publishes to the public site.
 *
 * @param {string} publishHistoryEntryId
 * @param {{ adminId?: string, ip?: string, requestId?: string }} [meta]
 */
export function restorePublishHistoryEntryToDraft(publishHistoryEntryId, meta = {}) {
  const store = readPublishHistory();
  const entry = (store.entries || []).find((row) => row.id === publishHistoryEntryId);
  if (!entry) {
    return { ok: false, error: "Publish history entry not found", status: 404 };
  }

  const title = String(entry.title || entry.newsTitle || entry.headline || "Restored draft").trim();
  const summary = String(entry.summary || entry.seoDescription || "").trim();
  const body = String(entry.body || entry.contentSnapshot || summary || title).trim();
  const snapshotText = extractSnapshotTextFromHistoryEntry(entry) || `${title}\n${summary}\n${body}`;
  const validation = validatePublishableCopy(snapshotText);

  const created = createPendingDraft({
    country: entry.country || "AU",
    sourceId: entry.sourceId || "restore",
    sourceName: entry.source || entry.sourceName || "Restored draft",
    sourceUrl: entry.sourceUrl || "",
    headline: title,
    summary,
    body,
    seoTitle: title,
    seoDescription: summary,
    tags: ["restored-from-history", "compliance-review"],
    faqSuggestions: [],
    grounding: {
      sourceUrl: entry.sourceUrl || "",
      confidence: 0,
      excerpt: summary.slice(0, 400),
      restoredFromPublishHistoryId: entry.id,
      complianceValidationOk: validation.ok,
      complianceMatches: validation.matches || [],
    },
  });

  // Persist draft-only status + compliance metadata (createPendingDraft writes "pending").
  const draft =
    updateDraftStatus({
      id: created.id,
      status: "draft",
      moderationNote: !validation.ok
        ? `Compliance restore blocked from public publish: ${(validation.matches || []).join("; ")}`
        : "Restored from publish history — review before publish.",
      edits: {
        restoredFromPublishHistoryId: entry.id,
        complianceRestore: {
          validationOk: validation.ok,
          matches: validation.matches || [],
          warnings: validation.warnings || [],
          restoredBy: meta.adminId || null,
          restoredAt: new Date().toISOString(),
          blockedFromPublicPublish: true,
        },
      },
    }) || created;

  try {
    appendAudit(AUDIT_ACTIONS.INTEL_PUBLISH_ROLLBACK, publishHistoryEntryId, {
      ip: meta.ip,
      route: "restorePublishHistoryEntryToDraft",
      requestId: meta.requestId,
      meta: {
        action: "restore_to_draft",
        draftId: draft.id,
        validationOk: validation.ok,
        matches: validation.matches || [],
        warnings: validation.warnings || [],
        blockedFromPublicPublish: true,
      },
    });
  } catch {
    /* audit best-effort */
  }

  return {
    ok: true,
    draft,
    validation,
    complianceWarning: !validation.ok
      ? "Restored content failed current compliance validation and was saved as draft only. It cannot be published until prohibited claims are removed."
      : "Restored to draft. Review and publish deliberately after compliance checks.",
    blockedFromPublicPublish: true,
  };
}

/**
 * @param {string} title
 * @param {string} summary
 * @param {string} body
 */
export function assertCanPublishNewsCopy(title, summary, body) {
  const validation = validatePublishableCopy(`${title}\n${summary}\n${body}`);
  if (!validation.ok) {
    const err = new Error(
      `Publish blocked by no-MARN compliance guard (prohibited claims: ${validation.matches.join(", ")}).`
    );
    err.code = "COMPLIANCE_BLOCKED";
    err.validation = validation;
    throw err;
  }
  return validation;
}

/**
 * Pure helper for tests: a non-compliant historical snapshot must not be allowed public.
 * @param {string} snapshotText
 */
export function canRestoreSnapshotDirectlyToPublic(snapshotText) {
  return validatePublishableCopy(snapshotText).ok === true;
}
