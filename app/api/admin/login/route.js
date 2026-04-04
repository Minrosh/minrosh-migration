import { cookies } from "next/headers";
import { hasAdminPasswordConfigured, verifyAdminPassword } from "@/lib/admin/admin-auth";
import { createSessionToken } from "@/lib/admin/session";
import { requireAdminLoginOrigin } from "@/lib/admin/auth-route";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";

export async function POST(request) {
  const originDenied = requireAdminLoginOrigin(request);
  if (originDenied) return originDenied;

  const ip = getClientIp(request);
  if (!rateLimitAllow(`admin-login:${ip}`, { windowMs: 15 * 60 * 1000, max: 25 })) {
    return Response.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = String(body?.password || "");
  if (!hasAdminPasswordConfigured()) {
    return Response.json({ error: "Admin password not configured" }, { status: 503 });
  }
  if (!verifyAdminPassword(password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createSessionToken();
  if (!token) {
    return Response.json({ error: "Could not create session" }, { status: 500 });
  }

  const jar = await cookies();
  const secure =
    process.env.ADMIN_COOKIE_SECURE === "true" ||
    (process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_SECURE !== "false");

  jar.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
