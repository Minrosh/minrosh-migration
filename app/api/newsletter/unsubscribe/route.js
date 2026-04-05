import { unsubscribeNewsletterByToken } from "@/lib/newsletter";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`newsletter-unsub:${ip}`, { windowMs: 15 * 60 * 1000, max: 30 })) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const token = String(body?.token || "").trim();
  const result = unsubscribeNewsletterByToken(token);
  if (!result.ok) {
    return Response.json({ error: result.error || "Could not unsubscribe." }, { status: 400 });
  }
  return Response.json({
    ok: true,
    already: Boolean(result.already),
    message: result.already ? "This address is already unsubscribed." : "You have been unsubscribed from marketing emails.",
  });
}

export async function GET(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`newsletter-unsub-get:${ip}`, { windowMs: 15 * 60 * 1000, max: 40 })) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get("token") || "").trim();
  const result = unsubscribeNewsletterByToken(token);
  if (!result.ok) {
    return Response.redirect(new URL("/newsletter/unsubscribe?error=1", request.url), 302);
  }
  return Response.redirect(new URL("/newsletter/unsubscribe?ok=1", request.url), 302);
}
