import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { getInvoice, getBankDetails } from "@/lib/admin/invoices-service";
import { buildInvoicePdfBuffer } from "@/lib/admin/invoice-pdf";
import { API_ERROR_CODES, apiFail, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { id } = await params;
  const inv = getInvoice(id);
  if (!inv) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  }
  const { searchParams } = new URL(request.url);
  const forceDownload = searchParams.get("download") === "1";
  const bytes = await buildInvoicePdfBuffer(inv, getBankDetails());
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${inv.invoiceNumber}.pdf"`,
    },
  });
}
