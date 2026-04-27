import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { createQuote, listQuotes } from "@/lib/crm/quotes-service";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ quotes: listQuotes() }, context);
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
  const quote = await createQuote(body);
  const ip = getClientIp(request);
  appendAudit(AUDIT_ACTIONS.CRM_QUOTE_CREATE, quote.id, {
    ip,
    route: "POST /api/admin/quotes",
    requestId: context.requestId,
  });
  return apiOk({ quote }, context);
}
