import {
  websiteComplianceFile,
  websiteComplianceSeed,
} from "@/lib/admin/paths";
import {
  readWebsiteStore,
  withWebsiteStoreMutation,
  writeWebsiteStore,
} from "@/lib/website/website-store";

const DEFAULTS = {
  schemaVersion: 1,
  showMarn: false,
  marnText: "Available on request",
  disclaimerText: "",
  noGuaranteeText: "",
  assessmentDisclaimer: "",
  footerComplianceWording: "",
  updatedAt: null,
  updatedBy: null,
};

function validateComplianceStore(raw) {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid store" };
  if (Number(raw.schemaVersion) !== 1) return { ok: false, error: "Unsupported schemaVersion" };
  return {
    ok: true,
    data: {
      schemaVersion: 1,
      showMarn: Boolean(raw.showMarn),
      marnText: String(raw.marnText || DEFAULTS.marnText).trim(),
      disclaimerText: String(raw.disclaimerText || "").trim(),
      noGuaranteeText: String(raw.noGuaranteeText || "").trim(),
      assessmentDisclaimer: String(raw.assessmentDisclaimer || "").trim(),
      footerComplianceWording: String(raw.footerComplianceWording || "").trim(),
      updatedAt: raw.updatedAt || null,
      updatedBy: raw.updatedBy || null,
    },
  };
}

export function readComplianceForAdmin() {
  return readWebsiteStore(websiteComplianceFile, websiteComplianceSeed, validateComplianceStore, DEFAULTS);
}

export function getComplianceSettings() {
  const result = readComplianceForAdmin();
  if (!result.ok || !result.data) return { ...DEFAULTS };
  return result.data;
}

/**
 * @param {Partial<typeof DEFAULTS>} patch
 * @param {string} [updatedBy]
 */
export function writeComplianceSettings(patch, updatedBy) {
  return withWebsiteStoreMutation(websiteComplianceFile, () => {
    const current = getComplianceSettings();
    const next = validateComplianceStore({
      ...current,
      ...patch,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || null,
    });
    if (!next.ok || !next.data) throw new Error(next.error || "Validation failed");
    writeWebsiteStore(websiteComplianceFile, next.data);
    return next.data;
  });
}
