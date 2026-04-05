import { NextResponse } from "next/server";
import { verifyAdminSessionCookie } from "./lib/admin/session-signed-cookie";
import { getAdminSessionValueFromRequestCookies } from "./lib/admin/session-cookie";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminApp =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  if (!isAdminApp) return NextResponse.next();

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (pathname === "/api/admin/login") return NextResponse.next();

  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) {
    return new NextResponse("Admin is not configured. Set ADMIN_PASSWORD in the environment.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const cookieVal = getAdminSessionValueFromRequestCookies(request.cookies);
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  const signed = cookieVal && secret ? await verifyAdminSessionCookie(cookieVal, secret) : { ok: false };
  const ok = signed.ok;
  if (!ok) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
