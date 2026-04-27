import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { readCrmAutomations, writeCrmAutomations } from "@/lib/admin/crm-store";
import { getClientIp } from "@/lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk(readCrmAutomations(), context);
}

export async function PUT(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  if (!body || !Array.isArray(body.rules)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "rules array required", status: 400 }, context);
  }
  writeCrmAutomations({ rules: body.rules.slice(0, 100) });
  appendAudit(AUDIT_ACTIONS.CRM_AUTOMATIONS_UPDATE, "crm-automations", {
    ip: getClientIp(request),
    route: "PUT /api/admin/automations",
    requestId: context.requestId,
    meta: {
      ruleCount: Array.isArray(body.rules) ? body.rules.length : 0,
    },
  });
  return apiOk({ saved: true }, context);
}
