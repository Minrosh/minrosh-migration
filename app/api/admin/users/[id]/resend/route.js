import { requireSuperAdmin } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { sendAdminEmailVerification } from "@/lib/admin/admin-user-mail";
import { regenerateAdminVerificationToken } from "@/lib/admin/admin-users-service";
import { buildAdminVerifyUrl } from "@/lib/admin/admin-user-verify-url";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { obsLogger } from "@/lib/observability/logger";

export async function POST(request, context) {
  const reqContext = requestContextFromRequest(request);
  const denied = await requireSuperAdmin(request);
  if (denied) return denied;
  const { id: rawId } = await context.params;
  const id = String(rawId || "").trim();
  if (!id) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Missing id", status: 400 }, reqContext);
  }
  try {
    const { plainVerificationToken, email } = regenerateAdminVerificationToken(id);
    const verifyUrl = buildAdminVerifyUrl({ requestUrl: request.url, plainVerificationToken });
    const sent = await sendAdminEmailVerification({ to: email, verifyUrl });
    const ip = getClientIp(request);
    appendAudit(AUDIT_ACTIONS.ADMIN_USER_RESEND_VERIFY, id, {
      ip,
      route: "POST /api/admin/users/[id]/resend",
      requestId: reqContext.requestId,
    });
    return apiOk({
      verificationEmailSent: sent.ok,
      verificationEmailError: sent.ok ? undefined : sent.reason,
      verificationUrl: verifyUrl,
    }, reqContext);
  } catch (e) {
    obsLogger.error("admin_user_resend_failed", { requestId: reqContext.requestId, route: "POST /api/admin/users/[id]/resend", error: e });
    const code = String(e?.code || "");
    const status =
      code === "NOT_FOUND" ? 404 : code === "CONFLICT" ? 409 : code === "VALIDATION_FAILED" ? 400 : 500;
    return apiFail(
      { code: code || API_ERROR_CODES.INTERNAL_ERROR, status, message: status >= 500 ? "Could not resend verification." : String(e?.message || "Could not resend verification.") },
      reqContext
    );
  }
}
