import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";
import { runIntelligenceScan } from "@/lib/intelligence/scan";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  const result = await runIntelligenceScan({ actor: "admin_manual" });
  appendAudit(AUDIT_ACTIONS.INTEL_SCAN_MANUAL, `changed=${result.changed}`, {
    ip: getClientIp(request),
    route: "POST /api/admin/intelligence/run-scan",
    requestId: context.requestId,
  });
  return apiOk(result, context);
}
