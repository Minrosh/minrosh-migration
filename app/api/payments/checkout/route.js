import { createStripeCheckoutSession, stripeEnabled } from "@/lib/payments/stripe";

export async function POST(request) {
  if (!stripeEnabled()) {
    return Response.json({ ok: false, error: "Stripe is not configured." }, { status: 503 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
  }
  const amountCents = Number(body?.amountCents || 0);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return Response.json({ ok: false, error: "Invalid amount." }, { status: 400 });
  }
  const session = await createStripeCheckoutSession({
    amountCents,
    customerEmail: String(body?.email || "").trim(),
    customerName: String(body?.name || "").trim(),
    metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
    successPath: "/book-consultation?payment=success",
    cancelPath: "/book-consultation?payment=cancelled",
  });
  if (!session.ok) {
    return Response.json({ ok: false, error: session.error || "Stripe checkout failed." }, { status: 502 });
  }
  return Response.json({ ok: true, checkoutUrl: session.url, checkoutSessionId: session.id });
}
