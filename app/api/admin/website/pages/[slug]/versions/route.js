import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { listWebsiteVersions } from "@/lib/website/version-store";
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
  const versions = listWebsiteVersions(slug).map((v) => ({
    id: v.id,
    pageSlug: v.pageSlug,
    createdAt: v.createdAt,
    publishedBy: v.publishedBy,
    status: v.status,
    rolledBackAt: v.rolledBackAt || null,
  }));
  return apiOk({ versions }, context);
}
