import { randomUUID } from "node:crypto";
import { appendCrmInteraction } from "@/lib/admin/crm-store";
import { updateCustomer, findCustomerById } from "@/lib/admin/customers-service";

const ALLOWED_TYPES = new Set(["email", "whatsapp", "webchat", "call", "note", "system"]);

/**
 * @param {{ customerId?: string, leadId?: string, type: string, channel?: string, subject?: string, body: string, meta?: object, actor?: string }} input
 */
export function recordInteraction(input) {
  const customerId = String(input.customerId || "").trim();
  const leadId = String(input.leadId || "").trim();
  const type = ALLOWED_TYPES.has(input.type) ? input.type : "note";
  const at = new Date().toISOString();
  const entry = {
    id: `int-${randomUUID()}`,
    at,
    customerId: customerId || undefined,
    leadId: leadId || undefined,
    type,
    channel: String(input.channel || "").trim().slice(0, 40) || undefined,
    subject: String(input.subject || "").trim().slice(0, 200) || undefined,
    body: String(input.body || "").trim().slice(0, 8000),
    meta: input.meta && typeof input.meta === "object" ? input.meta : undefined,
    actor: String(input.actor || "system").slice(0, 120),
  };
  appendCrmInteraction(entry);
  if (customerId && findCustomerById(customerId)) {
    updateCustomer(customerId, { lastContactAt: at });
  }
  return entry;
}
