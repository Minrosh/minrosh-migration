import { createStripeCheckoutSession, stripeEnabled } from "@/lib/payments/stripe";

export async function POST(request) {
  if (!stripeEnabled()) {
    console.info(JSON.stringify({ ts: new Date().toISOString(), level: "warn", event: "checkout_provider_not_configured" }));
    return Response.json({ ok: false, error: "Card payment is not available. No payment has been taken." }, { status: 503 });
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
    successPath: "/book-information-session?payment=success",
    cancelPath: "/book-information-session?payment=cancelled",
  });
  if (!session.ok) {
    console.info(JSON.stringify({ ts: new Date().toISOString(), level: "warn", event: "checkout_provider_failed", reason: session.reason || "unknown" }));
    return Response.json({ ok: false, error: "Payment could not be started. No payment has been taken." }, { status: 502 });
  }
  return Response.json({ ok: true, checkoutUrl: session.url, checkoutSessionId: session.id });
}
