import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/admin/session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = String(body?.password || "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return Response.json({ error: "Admin password not configured" }, { status: 503 });
  }
  if (password !== expected) {
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
