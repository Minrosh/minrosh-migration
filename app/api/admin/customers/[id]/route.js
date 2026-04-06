import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { sanitizeCustomerForAdminDetail } from "@/lib/admin/customer-dto";
import { findCustomerById } from "@/lib/admin/customers-service";

export async function GET(_request, { params }) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { id } = await params;
  const customer = findCustomerById(id);
  if (!customer) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ customer: sanitizeCustomerForAdminDetail(customer) });
}
