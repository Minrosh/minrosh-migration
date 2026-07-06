import { requireWebsitePublish } from "@/lib/admin/auth-route";
import { getAdminActorFromCookies } from "@/lib/admin/admin-identity";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { applyWebsitePageSnapshot, unpublishWebsitePage } from "@/lib/website/pages-store";
import {
  getWebsiteVersionById,
  markWebsiteVersionRolledBack,
} from "@/lib/website/version-store";
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
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  const actor = await getAdminActorFromCookies();
  const updatedBy = actor?.email || actor?.role || "admin";

  try {
    if (body.action === "unpublish") {
      const page = unpublishWebsitePage(slug);
      appendAudit(AUDIT_ACTIONS.WEBSITE_PAGE_UNPUBLISH, slug, {
        ip: getClientIp(request),
        route: `POST /api/admin/website/pages/${slug}/rollback`,
        requestId: context.requestId,
      });
      return apiOk({ page }, context);
    }

    const versionId = String(body.versionId || "").trim();
    if (!versionId) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "versionId required", status: 400 }, context);
    }
    const version = getWebsiteVersionById(versionId);
    if (!version || version.pageSlug !== slug) {
      return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Version not found", status: 404 }, context);
    }
    const target = body.target === "published" ? "published" : "draft";
    const page = applyWebsitePageSnapshot(slug, version.snapshot, { target, updatedBy });
    markWebsiteVersionRolledBack(versionId, { rolledBackBy: updatedBy });
    appendAudit(AUDIT_ACTIONS.WEBSITE_PAGE_ROLLBACK, `${slug} → ${target}`, {
      ip: getClientIp(request),
      route: `POST /api/admin/website/pages/${slug}/rollback`,
      requestId: context.requestId,
      meta: { versionId, target },
    });
    return apiOk({ page, target }, context);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Rollback failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
}
