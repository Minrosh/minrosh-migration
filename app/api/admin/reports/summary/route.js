import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";
import { buildCrmSummary } from "@/lib/crm/reports-service";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk(buildCrmSummary(), context);
}
