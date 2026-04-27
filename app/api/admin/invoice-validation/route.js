import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { validateInvoiceThreeWay } from "@/lib/invoice/validation-service";
import { getClientIp } from "@/lib/security/request-ip";

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
  const result = validateInvoiceThreeWay(body || {});
  if (!result.ok) {
    return apiFail(
      { code: API_ERROR_CODES.VALIDATION_FAILED, message: result?.error || "Validation failed", status: 400, details: result },
      context
    );
  }
  appendAudit(AUDIT_ACTIONS.INVOICE_VALIDATION_RUN, String(body?.invoiceId || ""), {
    ip: getClientIp(request),
    route: "POST /api/admin/invoice-validation",
    requestId: context.requestId,
    meta: {
      invoiceId: String(body?.invoiceId || ""),
      poId: String(body?.poId || ""),
      grnId: String(body?.grnId || ""),
    },
  });
  return apiOk(result, context);
}

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const url = new URL(request.url);
  const invoiceId = url.searchParams.get("invoiceId") || "";
  const poId = url.searchParams.get("poId") || "";
  const grnId = url.searchParams.get("grnId") || "";
  if (!invoiceId || !poId || !grnId) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "invoiceId, poId, grnId required", status: 400 }, context);
  }
  const result = validateInvoiceThreeWay({ invoiceId, poId, grnId });
  if (!result.ok) {
    return apiFail(
      { code: API_ERROR_CODES.VALIDATION_FAILED, message: result?.error || "Validation failed", status: 400, details: result },
      context
    );
  }
  return apiOk(result, context);
}
