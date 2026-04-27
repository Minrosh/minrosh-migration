import { adminJsonUnauthorized, verifyAdminRequest } from "@/lib/admin/auth-route";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";
import { invoiceSummaryReport } from "@/lib/invoice/reports-service";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk(invoiceSummaryReport(new Date()), context);
}
