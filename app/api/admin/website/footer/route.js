import { verifyAdminRequest, adminJsonUnauthorized, requireWebsiteWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { getFooterSettings, writeFooterSettings } from "@/lib/website/footer-store";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ footer: getFooterSettings() }, context);
}

export async function PUT(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireWebsiteWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  try {
    const footer = writeFooterSettings(
      {
        complianceLine: body.complianceLine,
        linkGroups: body.linkGroups,
        footerTagline: body.footerTagline,
        footerSummary: body.footerSummary,
        contactPhone: body.contactPhone,
        contactEmailLabel: body.contactEmailLabel,
        social: body.social,
      },
      body.updatedBy || "admin"
    );
    appendAudit(AUDIT_ACTIONS.WEBSITE_FOOTER_UPDATE, "footer", {
      ip: getClientIp(request),
      route: "PUT /api/admin/website/footer",
      requestId: context.requestId,
    });
    return apiOk({ footer }, context);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
}
