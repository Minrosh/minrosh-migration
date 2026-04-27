import { recordPayment } from "@/lib/admin/invoices-service";
import { verifyStripeWebhookSignature } from "@/lib/payments/stripe";

export async function POST(request) {
  const raw = await request.text();
  const signature = String(request.headers.get("stripe-signature") || "");
  if (!verifyStripeWebhookSignature({ payload: raw, signatureHeader: signature })) {
    return Response.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "Invalid webhook payload." }, { status: 400 });
  }

  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object || {};
    const invoiceId = String(session?.metadata?.invoiceId || "").trim();
    const amountTotal = Number(session?.amount_total || 0);
    if (invoiceId && Number.isFinite(amountTotal) && amountTotal > 0) {
      recordPayment({
        invoiceId,
        amount: amountTotal / 100,
        method: "stripe",
        reference: String(session?.payment_intent || session?.id || ""),
      });
    }
  }

  return Response.json({ ok: true });
}
