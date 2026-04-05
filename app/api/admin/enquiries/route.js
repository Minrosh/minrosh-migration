import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readEnquiriesList } from "@/lib/admin/enquiries-read";

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 200));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const all = readEnquiriesList();
  const total = all.length;
  return Response.json({
    enquiries: all.slice(offset, offset + limit),
    total,
    limit,
    offset,
  });
}
