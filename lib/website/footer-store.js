import {
  websiteFooterFile,
  websiteFooterSeed,
} from "@/lib/admin/paths";
import {
  readWebsiteStore,
  withWebsiteStoreMutation,
  writeWebsiteStore,
} from "@/lib/website/website-store";

const EMPTY = { schemaVersion: 1, complianceLine: "", linkGroups: [], updatedAt: null, updatedBy: null };

function validateFooterStore(raw) {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid store" };
  if (Number(raw.schemaVersion) !== 1) return { ok: false, error: "Unsupported schemaVersion" };
  const groups = Array.isArray(raw.linkGroups) ? raw.linkGroups : [];
  return {
    ok: true,
    data: {
      schemaVersion: 1,
      complianceLine: String(raw.complianceLine || "").trim(),
      linkGroups: groups.slice(0, 10).map((g) => ({
        title: String(g?.title || "").trim(),
        links: (Array.isArray(g?.links) ? g.links : []).slice(0, 20).map((l) => ({
          label: String(l?.label || "").trim(),
          href: String(l?.href || "").trim(),
        })),
      })),
      updatedAt: raw.updatedAt || null,
      updatedBy: raw.updatedBy || null,
    },
  };
}

export function readFooterForAdmin() {
  return readWebsiteStore(websiteFooterFile, websiteFooterSeed, validateFooterStore, EMPTY);
}

export function getFooterSettings() {
  const result = readFooterForAdmin();
  return result.ok && result.data ? result.data : EMPTY;
}

/**
 * @param {{ complianceLine?: string, linkGroups?: unknown[] }} patch
 * @param {string} [updatedBy]
 */
export function writeFooterSettings(patch, updatedBy) {
  return withWebsiteStoreMutation(websiteFooterFile, () => {
    const current = getFooterSettings();
    const next = validateFooterStore({
      ...current,
      ...patch,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || null,
    });
    if (!next.ok || !next.data) throw new Error(next.error || "Validation failed");
    writeWebsiteStore(websiteFooterFile, next.data);
    return next.data;
  });
}
