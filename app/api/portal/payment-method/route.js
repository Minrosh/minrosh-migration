import { getInvoiceByPortalToken } from "@/lib/admin/invoices-service";
import { stripeEnabled } from "@/lib/payments/stripe";

function tokenFromRequest(request) {
  const auth = String(request.headers.get("authorization") || "");
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  return m ? m[1].trim() : "";
}

export async function GET(request) {
  const token = tokenFromRequest(request);
  if (!token || !getInvoiceByPortalToken(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({
    supported: stripeEnabled() ? ["bank_transfer", "card_checkout"] : ["bank_transfer"],
    message: stripeEnabled()
      ? "Card checkout is available per invoice payment link. Stored cards remain disabled."
      : "Card storage is disabled. Pay by bank transfer using invoice instructions.",
  });
}

export async function POST(request) {
  const token = tokenFromRequest(request);
  if (!token || !getInvoiceByPortalToken(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({
    ok: false,
    message: "Payment method updates are disabled in this deployment (bank transfer only).",
  });
}
