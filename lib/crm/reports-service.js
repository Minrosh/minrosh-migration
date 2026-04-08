import { readCustomers } from "@/lib/admin/json-store";
import { readCrmLeads } from "@/lib/admin/crm-store";
import { readCrmOpportunities } from "@/lib/admin/crm-store";
import { readCrmInteractions } from "@/lib/admin/crm-store";
import { readJsonFile } from "@/lib/contact";
import path from "node:path";

function enquiriesPath() {
  return path.join(process.cwd(), "data", "enquiries.json");
}

export function buildCrmSummary() {
  const { customers } = readCustomers();
  const custList = Array.isArray(customers) ? customers : [];
  const { leads } = readCrmLeads();
  const leadList = Array.isArray(leads) ? leads : [];
  const { opportunities } = readCrmOpportunities();
  const oppList = Array.isArray(opportunities) ? opportunities : [];
  const { interactions } = readCrmInteractions();
  const intList = Array.isArray(interactions) ? interactions : [];
  const enquiries = readJsonFile(enquiriesPath(), []);

  const byStage = {};
  for (const o of oppList) {
    const s = o.stage || "unknown";
    byStage[s] = (byStage[s] || 0) + 1;
  }

  const openLeads = leadList.filter((l) => l.status === "open").length;
  const convertedLeads = leadList.filter((l) => l.status === "converted").length;

  return {
    generatedAt: new Date().toISOString(),
    customers: { total: custList.length },
    leads: { total: leadList.length, open: openLeads, converted: convertedLeads },
    opportunities: { total: oppList.length, byStage },
    interactions: { total: intList.length, last7d: intList.filter((i) => withinDays(i.at, 7)).length },
    enquiries: { total: Array.isArray(enquiries) ? enquiries.length : 0 },
  };
}

function withinDays(iso, days) {
  const t = new Date(iso || 0).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < days * 86400000;
}
