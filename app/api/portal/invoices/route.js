import { getInvoiceByPortalToken, listPayments } from "@/lib/admin/invoices-service";

function extractToken(request) {
  const auth = String(request.headers.get("authorization") || "");
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  if (m) return m[1].trim();
  const url = new URL(request.url);
  return String(url.searchParams.get("token") || "").trim();
}

export async function GET(request) {
  const token = extractToken(request);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const invoice = getInvoiceByPortalToken(token);
  if (!invoice) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const payments = listPayments({ invoiceId: invoice.id });
  return Response.json({
    invoices: [invoice],
    paymentHistory: payments,
    paymentInstructions: invoice.paymentInstructions || {},
  });
}
