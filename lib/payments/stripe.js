import crypto from "node:crypto";

function env(name) {
  return String(process.env[name] || "").trim();
}

export function stripeEnabled() {
  return Boolean(env("STRIPE_SECRET_KEY") && env("STRIPE_WEBHOOK_SECRET"));
}

export async function createStripeCheckoutSession({
  amountCents,
  customerEmail,
  customerName,
  metadata = {},
  successPath = "/book-consultation?payment=success",
  cancelPath = "/book-consultation?payment=cancelled",
}) {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) return { ok: false, reason: "stripe_not_configured" };
  const site = env("NEXT_PUBLIC_SITE_URL") || "https://minroshmigration.com.au";
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${site}${successPath}`);
  body.set("cancel_url", `${site}${cancelPath}`);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "aud");
  body.set("line_items[0][price_data][unit_amount]", String(amountCents));
  body.set("line_items[0][price_data][product_data][name]", "MinRosh Consultation");
  body.set("line_items[0][price_data][product_data][description]", "Consultation booking payment");
  if (customerEmail) body.set("customer_email", customerEmail);
  if (customerName) body.set("custom_text[submit][message]", `Booking for ${customerName}`);
  Object.entries(metadata).forEach(([k, v]) => {
    body.set(`metadata[${k}]`, String(v));
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  const data = await response.json();
  if (!response.ok) {
    return { ok: false, reason: "stripe_checkout_failed", error: data?.error?.message || "Stripe error" };
  }
  return { ok: true, id: data.id, url: data.url || "" };
}

function parseStripeSignature(signature) {
  const parts = String(signature || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const map = new Map();
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) map.set(key, value);
  }
  return { timestamp: map.get("t") || "", signatureV1: map.get("v1") || "" };
}

export function verifyStripeWebhookSignature({ payload, signatureHeader }) {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) return false;
  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed.timestamp || !parsed.signatureV1) return false;
  const signedPayload = `${parsed.timestamp}.${payload}`;
  const digest = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expected = Buffer.from(digest, "utf8");
  const provided = Buffer.from(parsed.signatureV1, "utf8");
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}

export function consultationChargeAmountCents(durationMins, offer = "first_15_free") {
  const basePerMinute = 8; // AUD cents unit -> $8/min baseline strategic consult
  const duration = Math.max(30, Math.min(60, Number(durationMins || 45)));
  const freeMinutes = offer === "first_15_free" ? 15 : 0;
  const billable = Math.max(0, duration - freeMinutes);
  return billable * basePerMinute * 100;
}
