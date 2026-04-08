import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { buildCrmSummary } from "@/lib/crm/reports-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json(buildCrmSummary());
}
