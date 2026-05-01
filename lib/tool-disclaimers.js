import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data/tool-disclaimers.json");

const DEFAULTS = {
  studentPlannerDisclaimer:
    "Figures are indicative bands for early budgeting only. They do not assess eligibility and do not replace official financial requirements.",
  prExplorerDisclaimer:
    "Diagrams are for orientation only. Migration law changes frequently; outcomes depend on individual circumstances.",
};

/**
 * Merged disclaimers for public tools and admin editing.
 * @returns {{ studentPlannerDisclaimer: string, prExplorerDisclaimer: string }}
 */
export function getToolDisclaimers() {
  if (!fs.existsSync(FILE)) {
    return { ...DEFAULTS };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return {
      studentPlannerDisclaimer: String(raw.studentPlannerDisclaimer || DEFAULTS.studentPlannerDisclaimer),
      prExplorerDisclaimer: String(raw.prExplorerDisclaimer || DEFAULTS.prExplorerDisclaimer),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * @param {{ studentPlannerDisclaimer?: string, prExplorerDisclaimer?: string }} patch
 */
export function writeToolDisclaimers(patch) {
  const current = getToolDisclaimers();
  const next = {
    studentPlannerDisclaimer: String(
      patch.studentPlannerDisclaimer ?? current.studentPlannerDisclaimer
    ).trim(),
    prExplorerDisclaimer: String(patch.prExplorerDisclaimer ?? current.prExplorerDisclaimer).trim(),
  };
  if (!next.studentPlannerDisclaimer || !next.prExplorerDisclaimer) {
    throw new Error("Both disclaimer fields must be non-empty");
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}
