import { randomUUID } from "node:crypto";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readCrmLeads, writeCrmLeads } from "@/lib/admin/crm-store";
import { crmLeadsFile } from "@/lib/admin/paths";
import path from "node:path";
import { computeLeadScores } from "./lead-scoring";
import { normalizeOpportunityStage } from "./opportunity-stages";
import { readCrmOpportunities, writeCrmOpportunities } from "@/lib/admin/crm-store";
import { recordInteraction } from "./record-interaction";

function lockPath() {
  return path.join(path.dirname(crmLeadsFile), ".crm-leads.lock");
}

export function listLeads() {
  const { leads } = readCrmLeads();
  return Array.isArray(leads) ? [...leads] : [];
}

export function findLeadById(id) {
  return listLeads().find((l) => l.id === id) || null;
}

export function createLead(payload) {
  const at = new Date().toISOString();
  const row = {
    id: `lead-${randomUUID()}`,
    schemaVersion: 1,
    createdAt: at,
    updatedAt: at,
    customerId: String(payload.customerId || "").trim() || undefined,
    enquiryId: String(payload.enquiryId || "").trim() || undefined,
    source: String(payload.source || "manual").trim().slice(0, 80),
    firstName: String(payload.firstName || "").trim(),
    lastName: String(payload.lastName || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    phone: String(payload.phone || "").trim(),
    mainNeed: String(payload.mainNeed || "General Enquiry").trim(),
    message: String(payload.message || "").trim(),
    status: "open",
    ...computeLeadScores({
      mainNeed: payload.mainNeed,
      message: payload.message,
      customerId: payload.customerId,
      enquiryId: payload.enquiryId,
      quizCompleted: payload.quizCompleted,
      quizCompletionDepth: payload.quizCompletionDepth,
      returnVisitCount: payload.returnVisitCount,
      consultationRequested: payload.consultationRequested,
    }),
  };
  withMutationLock(lockPath(), () => {
    const { leads } = readCrmLeads();
    const list = Array.isArray(leads) ? leads : [];
    list.unshift(row);
    writeCrmLeads({ leads: list.slice(0, 5000) });
  });
  return row;
}

export function updateLead(id, patch) {
  const allowed = new Set([
    "status",
    "customerId",
    "enquiryId",
    "firstName",
    "lastName",
    "email",
    "phone",
    "mainNeed",
    "message",
    "source",
    "engagementScore",
    "quizCompleted",
    "quizCompletionDepth",
    "returnVisitCount",
    "consultationRequested",
  ]);
  const clean = {};
  for (const k of allowed) {
    if (patch[k] === undefined) continue;
    clean[k] = patch[k];
  }
  return withMutationLock(lockPath(), () => {
    const { leads } = readCrmLeads();
    const list = Array.isArray(leads) ? leads : [];
    const i = list.findIndex((l) => l.id === id);
    if (i === -1) return null;
    const cur = list[i];
    const next = {
      ...cur,
      ...clean,
      id: cur.id,
      updatedAt: new Date().toISOString(),
    };
    Object.assign(next, computeLeadScores(next));
    list[i] = next;
    writeCrmLeads({ leads });
    return next;
  });
}

export function convertLeadToOpportunity(leadId, { title, value } = {}) {
  const lead = findLeadById(leadId);
  if (!lead) return { ok: false, error: "lead_not_found" };
  const at = new Date().toISOString();
  const oppId = `opp-${randomUUID()}`;
  const stage = normalizeOpportunityStage("new");
  const opportunity = {
    id: oppId,
    schemaVersion: 1,
    createdAt: at,
    updatedAt: at,
    customerId: lead.customerId || "",
    leadId: lead.id,
    title: String(title || `${lead.firstName} ${lead.lastName}`.trim() || "Opportunity").slice(0, 200),
    value: Number(value) || 0,
    stage,
    enteredStageAt: at,
    version: 1,
  };
  if (!opportunity.customerId) {
    return { ok: false, error: "lead_missing_customer" };
  }

  withMutationLock(lockPath(), () => {
    const op = readCrmOpportunities();
    const opps = Array.isArray(op.opportunities) ? op.opportunities : [];
    opps.unshift(opportunity);
    writeCrmOpportunities({ opportunities: opps.slice(0, 5000) });

    const { leads } = readCrmLeads();
    const list = Array.isArray(leads) ? leads : [];
    const i = list.findIndex((l) => l.id === leadId);
    if (i !== -1) {
      list[i] = { ...list[i], status: "converted", opportunityId: oppId, updatedAt: at };
      writeCrmLeads({ leads });
    }
  });

  recordInteraction({
    customerId: opportunity.customerId,
    leadId: lead.id,
    type: "system",
    body: `Lead converted to opportunity ${oppId} (${stage})`,
    meta: { opportunityId: oppId },
  });

  return { ok: true, opportunity };
}
