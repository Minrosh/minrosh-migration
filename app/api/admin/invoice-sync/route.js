import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { listSyncJobs, queueAccountingSync, runAccountingSync } from "@/lib/invoice/accounting-sync-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ jobs: listSyncJobs() }, context);
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
    const result = runAccountingSync(String(body.provider || "xero"));
    appendAudit(AUDIT_ACTIONS.INVOICE_SYNC_RUN, `${result.processed} jobs`, {
      ip,
      route: "POST /api/admin/invoice-sync",
      requestId: context.requestId,
    });
    return apiOk(result, context);
  }
  const job = queueAccountingSync({ provider: body?.provider, invoiceIds: body?.invoiceIds });
  appendAudit(AUDIT_ACTIONS.INVOICE_SYNC_QUEUE, job.id, {
    ip,
    route: "POST /api/admin/invoice-sync",
    requestId: context.requestId,
  });
  return apiOk({ job }, context);
}
