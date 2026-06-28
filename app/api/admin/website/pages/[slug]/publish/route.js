import {
  adminJsonUnauthorized,
  requireWebsitePublish,
  verifyAdminRequest,
} from "@/lib/admin/auth-route";
import { getAdminActorFromCookies } from "@/lib/admin/admin-identity";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { publishWebsitePage } from "@/lib/website/pages-store";
import { adminSlugToPath } from "@/lib/website/slug-utils";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

function resolveSlugParam(params) {
  const slugParam = params?.slug;
  const segment = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  return adminSlugToPath(segment);
}

export async function POST(request, { params }) {
  const context = requestContextFromRequest(request);
  const denied = await requireWebsitePublish(request);
  if (denied) return denied;
  const slug = resolveSlugParam(params);
  try {
    const actor = await getAdminActorFromCookies();
    const page = publishWebsitePage(slug, { publishedBy: actor?.email || actor?.role || "admin" });
    appendAudit(AUDIT_ACTIONS.WEBSITE_PAGE_PUBLISH, slug, {
      ip: getClientIp(request),
      route: `POST /api/admin/website/pages/${slug}/publish`,
      requestId: context.requestId,
    });
    return apiOk({ page }, context);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Publish failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
}
