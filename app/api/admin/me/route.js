import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { getAdminActorFromCookies } from "@/lib/admin/admin-identity";
import { getAdminRole, isSuperRole } from "@/lib/admin/permissions";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const actor = await getAdminActorFromCookies();
  const role = actor?.role || getAdminRole();
  return apiOk({
    email: actor?.email ?? null,
    role,
    userId: actor?.userId ?? null,
    isSuper: isSuperRole(role),
  }, context);
}
