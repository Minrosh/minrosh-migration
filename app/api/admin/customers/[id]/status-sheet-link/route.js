import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { findCustomerById } from "@/lib/admin/customers-service";
import { getPortalStatusForCustomer } from "@/lib/google-sheets";

export async function GET(_request, { params }) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { id } = await params;
  const customer = findCustomerById(id);
  if (!customer) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const status = await getPortalStatusForCustomer({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
    });
    if (!status.found || !status.spreadsheetUrl) {
      if (status.reason && status.reason !== "status_not_found") {
        return Response.json({ error: "Status sheet integration is not ready." }, { status: 503 });
      }
      return Response.json({ error: "No matching sheet row found" }, { status: 404 });
    }
    return Response.json({
      url: status.spreadsheetUrl,
      rowNumber: status.rowNumber,
      sheetName: status.sheetName,
    });
  } catch {
    return Response.json({ error: "Could not resolve sheet row" }, { status: 500 });
  }
}
