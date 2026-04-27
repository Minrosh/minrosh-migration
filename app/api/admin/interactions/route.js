import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { recordInteraction } from "@/lib/crm/record-interaction";
import { readCrmInteractions } from "@/lib/admin/crm-store";
import { getAdminRole } from "@/lib/admin/permissions";
import { getClientIp } from "@/lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { searchParams } = new URL(request.url);
  const customerId = String(searchParams.get("customerId") || "").trim();
  const leadId = String(searchParams.get("leadId") || "").trim();
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 80));
  const { interactions } = readCrmInteractions();
  let list = Array.isArray(interactions) ? interactions : [];
  if (customerId) list = list.filter((i) => i.customerId === customerId);
  if (leadId) list = list.filter((i) => i.leadId === leadId);
  list = list.slice(0, limit);
  list.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return apiOk({ interactions: list }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const customerId = String(body.customerId || "").trim();
  const leadId = String(body.leadId || "").trim();
  const type = String(body.type || "note").trim();
  const bodyText = String(body.body || "").trim();
  if (!bodyText) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "body required", status: 400 }, context);
  if (!customerId && !leadId) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "customerId or leadId required", status: 400 }, context);
  }
  const entry = recordInteraction({
    customerId: customerId || undefined,
    leadId: leadId || undefined,
    type,
    channel: body.channel,
    subject: body.subject,
    body: bodyText,
    meta: body.meta,
    actor: getAdminRole(),
  });
  appendAudit(AUDIT_ACTIONS.CRM_INTERACTION_CREATE, entry.id, {
    ip: getClientIp(request),
    route: "POST /api/admin/interactions",
    requestId: context.requestId,
    meta: {
      customerId: entry.customerId || "",
      leadId: entry.leadId || "",
      type: entry.type || "",
      channel: entry.channel || "",
    },
  });
  return apiOk({ interaction: entry }, context);
}
