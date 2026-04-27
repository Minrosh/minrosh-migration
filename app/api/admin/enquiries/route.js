import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readEnquiriesList } from "@/lib/admin/enquiries-read";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 200));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const all = readEnquiriesList();
  const total = all.length;
  return apiOk({
    enquiries: all.slice(offset, offset + limit),
    total,
    limit,
    offset,
  }, context);
}
