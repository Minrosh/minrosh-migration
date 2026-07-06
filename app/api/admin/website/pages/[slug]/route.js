import { verifyAdminRequest, adminJsonUnauthorized, requireWebsiteWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import {
  getWebsitePageBySlugForAdmin,
  saveWebsitePageDraft,
} from "@/lib/website/pages-store";
import { adminSlugToPath } from "@/lib/website/slug-utils";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

function resolveSlugParam(params) {
  const slugParam = params?.slug;
  const segment = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  return adminSlugToPath(segment);
}

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const slug = resolveSlugParam(params);
  const result = getWebsitePageBySlugForAdmin(slug);
  if (!result.ok || !result.page) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: result.error || "Page not found", status: 404 }, context);
  }
  return apiOk({ page: result.page }, context);
}

export async function PUT(request, { params }) {
  const context = requestContextFromRequest(request);
  const denied = await requireWebsiteWrite(request);
  if (denied) return denied;
  const slug = resolveSlugParam(params);
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  try {
    const page = saveWebsitePageDraft(slug, {
      sections: body.sections,
      seo: body.seo,
      pageTitle: body.pageTitle,
      updatedBy: body.updatedBy || "admin",
    });
    const ip = getClientIp(request);
    appendAudit(AUDIT_ACTIONS.WEBSITE_PAGE_DRAFT_SAVE, slug, {
      ip,
      route: `PUT /api/admin/website/pages/${slug}`,
      requestId: context.requestId,
    });
    return apiOk({ page }, context);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
}
