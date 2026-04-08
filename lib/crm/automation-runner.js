import { readCrmAutomations } from "@/lib/admin/crm-store";
import { createTask } from "./tasks-service";
import { listOpportunities } from "./opportunities-service";

/**
 * @param {{ now?: Date, trigger: string, payload?: object }} input
 * @returns {{ tasksCreated: number, skipped: number }}
 */
export function runAutomationRules({ now = new Date(), trigger, payload = {} } = {}) {
  const { rules } = readCrmAutomations();
  const list = Array.isArray(rules) ? rules : [];
  let tasksCreated = 0;
  let skipped = 0;

  for (const rule of list) {
    if (!rule?.enabled || rule.trigger !== trigger) continue;
    const actions = Array.isArray(rule.actions) ? rule.actions : [];
    for (const action of actions) {
      if (action.type === "create_task") {
        const title = String(action.title || "Follow-up").slice(0, 300);
        const due = new Date(now.getTime() + Number(action.dueInDays || 0) * 86400000).toISOString();
        const customerId = String(payload.customerId || "").trim();
        const opportunityId = String(payload.opportunityId || "").trim();
        if (!customerId && !opportunityId) {
          skipped += 1;
          continue;
        }
        createTask({
          title,
          customerId: customerId || undefined,
          opportunityId: opportunityId || undefined,
          dueAt: due,
          source: `automation:${rule.id}`,
        });
        tasksCreated += 1;
      }
    }
  }
  return { tasksCreated, skipped };
}

/**
 * Stage-unchanged rule: for each opportunity where stage unchanged > rule.days, enqueue task once per run (best-effort).
 */
export function runStaleStageAutomations(now = new Date()) {
  const { rules } = readCrmAutomations();
  const staleRules = (Array.isArray(rules) ? rules : []).filter(
    (r) => r?.enabled && r.trigger === "stage_unchanged_days" && Number(r.days) > 0,
  );
  if (!staleRules.length) return { tasksCreated: 0 };

  const opps = listOpportunities();
  let tasksCreated = 0;
  const thresholdMs = Math.min(...staleRules.map((r) => Number(r.days) * 86400000));

  for (const opp of opps) {
    if (opp.stage === "won" || opp.stage === "lost") continue;
    const entered = new Date(opp.enteredStageAt || opp.updatedAt || opp.createdAt || now).getTime();
    if (now.getTime() - entered < thresholdMs) continue;
    createTask({
      title: `Review stalled deal (${opp.stage})`,
      customerId: opp.customerId,
      opportunityId: opp.id,
      dueAt: now.toISOString(),
      source: "automation:stage_stale",
    });
    tasksCreated += 1;
  }
  return { tasksCreated };
}
