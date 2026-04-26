import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readJsonFile, writeJsonAtomic } from "@/lib/contact";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { socialDmLeadsFile } from "@/lib/admin/paths";
import { createLead } from "@/lib/crm/leads-service";

const HOT_LEAD_PATTERNS = /(apply|visa|consult|consultation|book|eligib|sponsor|urgent|help me|how much|cost)/i;

function ensureStore() {
  if (fs.existsSync(socialDmLeadsFile)) return;
  fs.mkdirSync(path.dirname(socialDmLeadsFile), { recursive: true });
  writeJsonAtomic(socialDmLeadsFile, { items: [] });
}

function lockPath() {
  return path.join(path.dirname(socialDmLeadsFile), ".social-dm-leads.lock");
}

export function evaluateDmLeadIntent({ commentText }) {
  const text = String(commentText || "").trim();
  const intentScore = Math.min(100, HOT_LEAD_PATTERNS.test(text) ? 78 : 28);
  return {
    hotLead: intentScore >= 70,
    intentScore,
    rubric: HOT_LEAD_PATTERNS.test(text) ? ["intent_keyword_match"] : ["low_intent"],
  };
}

export function storeDmLeadSignal(payload) {
  return withMutationLock(lockPath(), () => {
    ensureStore();
    const store = readJsonFile(socialDmLeadsFile, { items: [] });
    const items = Array.isArray(store.items) ? store.items : [];
    const row = {
      id: `social-dm-lead-${randomUUID()}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    items.unshift(row);
    writeJsonAtomic(socialDmLeadsFile, { items: items.slice(0, 4000) });
    return row;
  });
}

export function createCrmHotLeadFromSocial({ commentText, platform = "facebook" }) {
  const evaluation = evaluateDmLeadIntent({ commentText });
  const signal = storeDmLeadSignal({
    platform,
    commentText: String(commentText || ""),
    intentScore: evaluation.intentScore,
    hotLead: evaluation.hotLead,
    rubric: evaluation.rubric,
  });
  if (!evaluation.hotLead) {
    return { signal, lead: null, evaluation };
  }
  const lead = createLead({
    source: `${platform}_dm_qualifier`,
    firstName: "Social",
    lastName: "Lead",
    email: "",
    phone: "",
    preferredCountry: "Australia",
    mainNeed: "Visa consultation request",
    message: commentText,
    consultationRequested: true,
  });
  return { signal, lead, evaluation };
}
