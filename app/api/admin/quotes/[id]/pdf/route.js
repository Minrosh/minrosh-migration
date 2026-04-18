import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { API_ERROR_CODES, apiFail, requestContextFromRequest } from "@/lib/api/response";
import { findQuote, renderQuotePdf } from "@/lib/crm/quotes-service";

export async function GET(request, { params }) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { id } = await params;
  const quote = findQuote(id);
  if (!quote) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  }
  const buf = await renderQuotePdf(quote);
  return new Response(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${quote.quoteNumber}.pdf"`,
    },
  });
}
