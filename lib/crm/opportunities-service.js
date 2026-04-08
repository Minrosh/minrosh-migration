import path from "node:path";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readCrmOpportunities, writeCrmOpportunities } from "@/lib/admin/crm-store";
import { crmOpportunitiesFile } from "@/lib/admin/paths";
import { normalizeOpportunityStage } from "./opportunity-stages";
import { recordInteraction } from "./record-interaction";

function lockPath() {
  return path.join(path.dirname(crmOpportunitiesFile), ".crm-opportunities.lock");
}

export function listOpportunities() {
  const { opportunities } = readCrmOpportunities();
  return Array.isArray(opportunities) ? [...opportunities] : [];
}

export function updateOpportunityStage(id, { stage, expectedVersion, note }) {
  return withMutationLock(lockPath(), () => {
    const data = readCrmOpportunities();
    const list = Array.isArray(data.opportunities) ? data.opportunities : [];
    const i = list.findIndex((o) => o.id === id);
    if (i === -1) return { ok: false, error: "not_found" };
    const cur = list[i];
    if (expectedVersion != null && Number(cur.version) !== Number(expectedVersion)) {
      return { ok: false, error: "version_conflict", current: cur };
    }
    const nextStage = normalizeOpportunityStage(stage);
    const at = new Date().toISOString();
    const next = {
      ...cur,
      stage: nextStage,
      enteredStageAt: nextStage !== cur.stage ? at : cur.enteredStageAt,
      version: Number(cur.version || 1) + 1,
      updatedAt: at,
    };
    list[i] = next;
    writeCrmOpportunities({ opportunities: list });
    if (cur.customerId) {
      recordInteraction({
        customerId: cur.customerId,
        type: "system",
        body: note || `Opportunity stage: ${cur.stage} → ${nextStage}`,
        meta: { opportunityId: id, from: cur.stage, to: nextStage },
      });
    }
    return { ok: true, opportunity: next };
  });
}
