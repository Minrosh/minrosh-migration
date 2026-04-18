import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { sanitizeCustomerForAdminDetail } from "@/lib/admin/customer-dto";
import { findCustomerById } from "@/lib/admin/customers-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { id } = await params;
  const customer = findCustomerById(id);
  if (!customer) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  }
  return apiOk({ customer: sanitizeCustomerForAdminDetail(customer) }, context);
}
