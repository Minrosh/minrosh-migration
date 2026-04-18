import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { listReminderRules, runInvoiceReminders, upsertReminderRule } from "@/lib/invoice/reminder-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ rules: listReminderRules() }, context);
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
    const result = runInvoiceReminders(new Date());
    appendAudit(AUDIT_ACTIONS.INVOICE_REMINDER_RUN, `${result.sentCount} reminders`, {
      ip,
      route: "POST /api/admin/invoice-reminders",
      requestId: context.requestId,
    });
    return apiOk(result, context);
  }
  const rule = upsertReminderRule(body || {});
  appendAudit(AUDIT_ACTIONS.INVOICE_REMINDER_UPSERT, rule.id, {
    ip,
    route: "POST /api/admin/invoice-reminders",
    requestId: context.requestId,
  });
  return apiOk({ rule }, context);
}
