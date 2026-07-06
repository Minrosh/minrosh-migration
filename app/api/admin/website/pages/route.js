import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { getEffectiveAdminRole } from "@/lib/admin/admin-identity";
import { listWebsitePagesForAdmin } from "@/lib/website/pages-store";
import { isWebsiteCmsEnabled } from "@/lib/website/cms-loader";
import { websitePermissionsForRole } from "@/lib/website/permissions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const listed = listWebsitePagesForAdmin();
  if (!listed.ok) {
    return apiFail(
      { code: API_ERROR_CODES.INTERNAL_ERROR, message: listed.error || "Could not read pages", status: 500 },
      context
    );
  }
  const role = await getEffectiveAdminRole();
  return apiOk(
    {
      pages: listed.pages,
      cmsEnabled: isWebsiteCmsEnabled(),
      permissions: websitePermissionsForRole(role),
    },
    context
  );
}
