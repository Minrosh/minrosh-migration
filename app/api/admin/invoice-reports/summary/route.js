import { adminJsonUnauthorized, verifyAdminRequest } from "@/lib/admin/auth-route";
import { invoiceSummaryReport } from "@/lib/invoice/reports-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json(invoiceSummaryReport(new Date()));
}
