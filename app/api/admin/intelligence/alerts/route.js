import { adminJsonUnauthorized, verifyAdminRequest } from "@/lib/admin/auth-route";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";
import { readAdminAlerts } from "@/lib/intelligence/store";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const store = readAdminAlerts();
  return apiOk({ alerts: Array.isArray(store.alerts) ? store.alerts : [] }, context);
}
