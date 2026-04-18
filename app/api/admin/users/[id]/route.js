import { requireSuperAdmin } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { deleteAdminUser, updateAdminUser } from "@/lib/admin/admin-users-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { obsLogger } from "@/lib/observability/logger";

export async function PATCH(request, context) {
  const reqContext = requestContextFromRequest(request);
  const denied = await requireSuperAdmin(request);
  if (denied) return denied;
  const { id: rawId } = await context.params;
  const id = String(rawId || "").trim();
  if (!id) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Missing id", status: 400 }, reqContext);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, reqContext);
  }
  try {
    const user = updateAdminUser(id, { password: body.password, role: body.role });
    const ip = getClientIp(request);
    appendAudit(AUDIT_ACTIONS.ADMIN_USER_UPDATE, id, { ip, route: "PATCH /api/admin/users/[id]", requestId: reqContext.requestId });
    return apiOk({ user }, reqContext);
  } catch (e) {
    obsLogger.error("admin_user_update_failed", { requestId: reqContext.requestId, route: "PATCH /api/admin/users/[id]", error: e });
    const code = String(e?.code || "");
    const status =
      code === "NOT_FOUND" ? 404 : code === "CONFLICT" ? 409 : code === "VALIDATION_FAILED" ? 400 : 500;
    return apiFail(
      { code: code || API_ERROR_CODES.INTERNAL_ERROR, status, message: status >= 500 ? "Could not update user." : String(e?.message || "Could not update user.") },
      reqContext
    );
  }
}

export async function DELETE(request, context) {
  const reqContext = requestContextFromRequest(request);
  const denied = await requireSuperAdmin(request);
  if (denied) return denied;
  const { id: rawId } = await context.params;
  const id = String(rawId || "").trim();
  if (!id) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Missing id", status: 400 }, reqContext);
  }
  try {
    deleteAdminUser(id);
    const ip = getClientIp(request);
    appendAudit(AUDIT_ACTIONS.ADMIN_USER_DELETE, id, { ip, route: "DELETE /api/admin/users/[id]", requestId: reqContext.requestId });
    return apiOk({ deleted: true }, reqContext);
  } catch (e) {
    obsLogger.error("admin_user_delete_failed", { requestId: reqContext.requestId, route: "DELETE /api/admin/users/[id]", error: e });
    const code = String(e?.code || "");
    const status =
      code === "NOT_FOUND" ? 404 : code === "CONFLICT" ? 409 : code === "VALIDATION_FAILED" ? 400 : 500;
    return apiFail(
      { code: code || API_ERROR_CODES.INTERNAL_ERROR, status, message: status >= 500 ? "Could not delete user." : String(e?.message || "Could not delete user.") },
      reqContext
    );
  }
}
