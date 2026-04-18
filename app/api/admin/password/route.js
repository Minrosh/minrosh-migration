import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";
import {
  hasAdminPasswordConfigured,
  setAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/admin-auth";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (!hasAdminPasswordConfigured()) {
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Admin password not configured", status: 503 }, context);
  }
  if (!verifyAdminPassword(currentPassword)) {
    return apiFail({ code: API_ERROR_CODES.UNAUTHORIZED, message: "Current password is incorrect", status: 401 }, context);
  }
  if (newPassword.length < 8) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "New password must be at least 8 characters", status: 400 }, context);
  }
  if (newPassword === currentPassword) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "New password must be different from current password", status: 400 }, context);
  }

  setAdminPassword(newPassword);
  appendAudit(AUDIT_ACTIONS.ADMIN_PASSWORD_CHANGE, "Password updated from admin panel", {
    ip,
    route: "POST /api/admin/password",
    requestId: context.requestId,
  });
  return apiOk({
    changed: true,
    note: "Password updated. Remove ADMIN_PASSWORD from .env to use this managed password.",
  }, context);
}
