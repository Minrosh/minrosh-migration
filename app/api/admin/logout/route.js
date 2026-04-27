import { cookies } from "next/headers";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { revokeAdminSessionToken } from "@/lib/admin/session-store";
import { extractAdminSessionTokenFromCookie } from "@/lib/admin/session-signed-cookie";
import { getAdminSessionSigningSecret } from "@/lib/admin/session";
import { checkAdminMutationOrigin } from "@/lib/security/admin-origin";
import { clearAdminSessionCookies, getAdminSessionValueFromJar } from "@/lib/admin/session-cookie";
import { getClientIp } from "@/lib/security/request-ip";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const o = checkAdminMutationOrigin(request);
  if (!o.ok) return apiFail({ code: API_ERROR_CODES.FORBIDDEN, message: o.error, status: 403 }, context);

  const jar = await cookies();
  const cookieVal = getAdminSessionValueFromJar(jar);
  const secret = getAdminSessionSigningSecret();
  const token = cookieVal ? await extractAdminSessionTokenFromCookie(cookieVal, secret) : null;
  if (token) {
    revokeAdminSessionToken(token);
  }
  appendAudit(AUDIT_ACTIONS.ADMIN_LOGOUT, token ? "session-token" : "no-token", {
    ip: getClientIp(request),
    route: "POST /api/admin/logout",
    requestId: context.requestId,
  });
  clearAdminSessionCookies(jar);
  return apiOk({ loggedOut: true }, context);
}
