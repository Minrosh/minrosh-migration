import { requireSuperAdmin, adminJsonUnauthorized, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { sendAdminEmailVerification } from "@/lib/admin/admin-user-mail";
import { createAdminUser, listAdminUsersPublic } from "@/lib/admin/admin-users-service";
import { buildAdminVerifyUrl } from "@/lib/admin/admin-user-verify-url";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { obsLogger } from "@/lib/observability/logger";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const denied = await requireSuperAdmin(request);
  if (denied) return denied;
  return apiOk({ users: listAdminUsersPublic() }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireSuperAdmin(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail(
      { code: API_ERROR_CODES.VALIDATION_FAILED, status: 400, message: "Invalid JSON" },
      context
    );
  }
  try {
    const { user, plainVerificationToken } = createAdminUser({
      email: body.email,
      password: body.password,
      role: body.role || "admin",
    });
    const verifyUrl = buildAdminVerifyUrl({ requestUrl: request.url, plainVerificationToken });
    const sent = await sendAdminEmailVerification({ to: user.email, verifyUrl });
    const ip = getClientIp(request);
    appendAudit(AUDIT_ACTIONS.ADMIN_USER_CREATE, user.id, {
      ip,
      email: user.email,
      route: "POST /api/admin/users",
      requestId: context.requestId,
    });
    return apiOk({
      user,
      verificationEmailSent: sent.ok,
      verificationEmailError: sent.ok ? undefined : sent.reason,
      verificationUrl: verifyUrl,
    }, context);
  } catch (e) {
    obsLogger.error("admin_user_create_failed", { requestId: context.requestId, route: "POST /api/admin/users", error: e });
    const code = String(e?.code || "");
    const status =
      code === "NOT_FOUND" ? 404 : code === "CONFLICT" ? 409 : code === "VALIDATION_FAILED" ? 400 : 500;
    return apiFail(
      {
        code: code || API_ERROR_CODES.INTERNAL_ERROR,
        status,
        message: status >= 500 ? "Could not create user." : String(e?.message || "Could not create user."),
      },
      context
    );
  }
}
