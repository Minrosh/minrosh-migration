import {
  adminJsonUnauthorized,
  requireWebsitePublish,
  verifyAdminRequest,
} from "@/lib/admin/auth-route";
import { getAdminActorFromCookies } from "@/lib/admin/admin-identity";
import { getAdminRole, isSuperRole } from "@/lib/admin/permissions";
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

function isProductionSite() {
  const staging = String(process.env.STAGING_SITE || "").trim().toLowerCase() === "true";
  const host = String(process.env.NEXT_PUBLIC_SITE_URL || "");
  const isStagingHost = host.includes("staging.");
  return process.env.NODE_ENV === "production" && !staging && !isStagingHost;
}

export async function POST(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const denied = await requireWebsitePublish(request);
  if (denied) return denied;
  const slug = resolveSlugParam(params);

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (slug === "/" && isProductionSite()) {
    const role = getAdminRole();
    if (!isSuperRole(role) && role !== "owner") {
      return apiFail(
        {
          code: API_ERROR_CODES.FORBIDDEN,
          message: "Homepage production publish requires owner or super role.",
          status: 403,
        },
        context,
      );
    }
    if (!body.ownerApprovalConfirmed) {
      return apiFail(
        {
          code: API_ERROR_CODES.VALIDATION_FAILED,
          message:
            "Homepage production publish requires ownerApprovalConfirmed: true after visual comparison.",
          status: 400,
        },
        context,
      );
    }
  }

  try {
    const actor = await getAdminActorFromCookies();
    const page = publishWebsitePage(slug, { publishedBy: actor?.email || actor?.role || "admin" });
    appendAudit(AUDIT_ACTIONS.WEBSITE_PAGE_PUBLISH, slug, {
      ip: getClientIp(request),
      route: `POST /api/admin/website/pages/${slug}/publish`,
      requestId: context.requestId,
    });
    if (slug === "/" && isProductionSite()) {
      appendAudit(AUDIT_ACTIONS.WEBSITE_HOMEPAGE_PUBLISH_APPROVED, slug, {
        ip: getClientIp(request),
        route: "POST /api/admin/website/pages/home/publish",
        requestId: context.requestId,
        actor: actor?.email || actor?.role,
      });
    }
    return apiOk({ page }, context);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Publish failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
}
