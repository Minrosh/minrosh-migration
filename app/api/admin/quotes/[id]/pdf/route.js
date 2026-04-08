import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { findQuote, renderQuotePdf } from "@/lib/crm/quotes-service";

export async function GET(_request, { params }) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { id } = await params;
  const quote = findQuote(id);
  if (!quote) return Response.json({ error: "Not found" }, { status: 404 });
  const buf = await renderQuotePdf(quote);
  return new Response(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${quote.quoteNumber}.pdf"`,
    },
  });
}
