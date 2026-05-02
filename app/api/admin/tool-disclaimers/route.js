import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { getToolDisclaimers, writeToolDisclaimers } from "@/lib/tool-disclaimers";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ disclaimers: getToolDisclaimers() }, context);
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
  try {
    writeToolDisclaimers({
      studentPlannerDisclaimer: body.studentPlannerDisclaimer,
      prExplorerDisclaimer: body.prExplorerDisclaimer,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
  const ip = getClientIp(request);
  appendAudit("tool_disclaimers_update", "studentPlanner + prExplorer", {
    ip,
    route: "PUT /api/admin/tool-disclaimers",
    requestId: context.requestId,
  });
  return apiOk({ disclaimers: getToolDisclaimers() }, context);
}
