import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { completeTask, createTask, listTasks } from "@/lib/crm/tasks-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { searchParams } = new URL(request.url);
  const customerId = String(searchParams.get("customerId") || "").trim();
  const openOnly = searchParams.get("openOnly") === "1";
  return apiOk({ tasks: listTasks({ customerId: customerId || undefined, openOnly }) }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const task = createTask({
    title: body.title,
    customerId: body.customerId,
    opportunityId: body.opportunityId,
    dueAt: body.dueAt,
    source: body.source,
  });
  appendAudit(AUDIT_ACTIONS.CRM_TASK_CREATE, task.id, {
    ip: getClientIp(request),
    route: "POST /api/admin/tasks",
    requestId: context.requestId,
  });
  return apiOk({ task }, context);
}

export async function PATCH(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const id = String(body.id || "").trim();
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);
  if (body.status === "done") {
    const t = completeTask(id);
    if (!t) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.CRM_TASK_COMPLETE, id, {
      ip: getClientIp(request),
      route: "PATCH /api/admin/tasks",
      requestId: context.requestId,
    });
    return apiOk({ task: t }, context);
  }
  return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Unsupported patch", status: 400 }, context);
}
