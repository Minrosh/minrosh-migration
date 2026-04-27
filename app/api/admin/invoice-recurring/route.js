import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { listRecurringRules, runRecurringBilling, upsertRecurringRule } from "@/lib/invoice/recurring-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ rules: listRecurringRules() }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  if (body?.action === "runNow") {
    const result = runRecurringBilling(new Date());
    appendAudit(AUDIT_ACTIONS.INVOICE_RECURRING_RUN, `${result.createdCount} created`, {
      ip,
      route: "POST /api/admin/invoice-recurring",
      requestId: context.requestId,
    });
    return apiOk(result, context);
  }
  const rule = upsertRecurringRule(body || {});
  appendAudit(AUDIT_ACTIONS.INVOICE_RECURRING_UPSERT, rule.id, {
    ip,
    route: "POST /api/admin/invoice-recurring",
    requestId: context.requestId,
  });
  return apiOk({ rule }, context);
}
