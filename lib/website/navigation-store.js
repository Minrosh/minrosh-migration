import {
  websiteNavigationFile,
  websiteNavigationSeed,
} from "@/lib/admin/paths";
import {
  readWebsiteStore,
  withWebsiteStoreMutation,
  writeWebsiteStore,
} from "@/lib/website/website-store";

const EMPTY = { schemaVersion: 1, primaryLinks: [], updatedAt: null, updatedBy: null };

function validateNavStore(raw) {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid store" };
  if (Number(raw.schemaVersion) !== 1) return { ok: false, error: "Unsupported schemaVersion" };
  const links = Array.isArray(raw.primaryLinks) ? raw.primaryLinks : [];
  return {
    ok: true,
    data: {
      schemaVersion: 1,
      primaryLinks: links.slice(0, 20).map((l) => ({
        label: String(l?.label || "").trim(),
        href: String(l?.href || "").trim(),
      })),
      updatedAt: raw.updatedAt || null,
      updatedBy: raw.updatedBy || null,
    },
  };
}

export function readNavigationForAdmin() {
  return readWebsiteStore(websiteNavigationFile, websiteNavigationSeed, validateNavStore, EMPTY);
}

export function getNavigationSettings() {
  const result = readNavigationForAdmin();
  return result.ok && result.data ? result.data : EMPTY;
}

/**
 * @param {{ primaryLinks: { label: string, href: string }[] }} patch
 * @param {string} [updatedBy]
 */
export function writeNavigationSettings(patch, updatedBy) {
  return withWebsiteStoreMutation(websiteNavigationFile, () => {
    const next = validateNavStore({
      schemaVersion: 1,
      primaryLinks: patch.primaryLinks,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || null,
    });
    if (!next.ok || !next.data) throw new Error(next.error || "Validation failed");
    writeWebsiteStore(websiteNavigationFile, next.data);
    return next.data;
  });
}
