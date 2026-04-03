import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readAudit } from "@/lib/admin/json-store";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json(readAudit());
}
