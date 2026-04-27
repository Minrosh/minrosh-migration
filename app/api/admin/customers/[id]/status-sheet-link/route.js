import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { findCustomerById } from "@/lib/admin/customers-service";
import { getPortalStatusForCustomer } from "@/lib/google-sheets";

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { id } = await params;
  const customer = findCustomerById(id);
  if (!customer) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  try {
    const status = await getPortalStatusForCustomer({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
    });
    if (!status.found || !status.spreadsheetUrl) {
      if (status.reason && status.reason !== "status_not_found") {
        return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Status sheet integration is not ready.", status: 503 }, context);
      }
      return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "No matching sheet row found", status: 404 }, context);
    }
    return apiOk({
      url: status.spreadsheetUrl,
      rowNumber: status.rowNumber,
      sheetName: status.sheetName,
    }, context);
  } catch {
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: "Could not resolve sheet row", status: 500 }, context);
  }
}
