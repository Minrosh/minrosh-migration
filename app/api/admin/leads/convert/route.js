import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";
import { convertLeadToOpportunity } from "@/lib/crm/leads-service";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  const leadId = String(body.leadId || "").trim();
  if (!leadId) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "leadId required", status: 400 }, context);
  const result = convertLeadToOpportunity(leadId, { title: body.title, value: body.value });
  if (!result.ok) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: result.error || "convert_failed", status: 400 }, context);
  }
  const ip = getClientIp(request);
  appendAudit(AUDIT_ACTIONS.CRM_LEAD_CONVERT, leadId, { ip, route: "POST /api/admin/leads/convert", requestId: context.requestId });
  return apiOk(result, context);
}
