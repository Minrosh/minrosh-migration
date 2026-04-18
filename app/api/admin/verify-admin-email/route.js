import { NextResponse } from "next/server";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { confirmAdminEmailToken } from "@/lib/admin/admin-users-service";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`admin-verify-email:${ip}`, { windowMs: 10 * 60 * 1000, max: 40 })) {
    return NextResponse.redirect(new URL("/admin/login?verify=rate", request.url));
  }

  const url = new URL(request.url);
  const token = String(url.searchParams.get("t") || "").trim();
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?verify=missing", request.url));
  }

  const result = confirmAdminEmailToken(token);
  if (!result.ok) {
    const q = result.reason === "expired" ? "verify=expired" : "verify=invalid";
    return NextResponse.redirect(new URL(`/admin/login?${q}`, request.url));
  }

  appendAudit(AUDIT_ACTIONS.ADMIN_USER_EMAIL_VERIFIED, result.email || "", {
    ip,
    route: "GET /api/admin/verify-admin-email",
  });

  return NextResponse.redirect(new URL("/admin/login?verify=ok", request.url));
}
