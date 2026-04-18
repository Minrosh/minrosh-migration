import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { listOpportunities, updateOpportunityStage } from "@/lib/crm/opportunities-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ opportunities: listOpportunities() }, context);
}

export async function PATCH(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const id = String(body.id || "").trim();
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);
  const result = updateOpportunityStage(id, {
    stage: body.stage,
    expectedVersion: body.expectedVersion,
    note: body.note,
  });
  if (!result.ok) {
    if (result.error === "version_conflict") {
      return apiFail({ code: API_ERROR_CODES.CONFLICT, message: "version_conflict", status: 409, details: result }, context);
    }
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "not_found", status: 404, details: result }, context);
  }
  appendAudit(AUDIT_ACTIONS.CRM_OPPORTUNITY_STAGE_UPDATE, id, {
    ip: getClientIp(request),
    route: "PATCH /api/admin/opportunities",
    requestId: context.requestId,
    meta: {
      stage: String(body.stage || ""),
      note: String(body.note || "").slice(0, 500),
    },
  });
  return apiOk(result, context);
}
