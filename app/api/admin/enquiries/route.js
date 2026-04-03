import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readEnquiriesList } from "@/lib/admin/enquiries-read";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ enquiries: readEnquiriesList() });
}
