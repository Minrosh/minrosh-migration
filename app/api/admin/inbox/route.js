import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import {
  appendInboxMessage,
  ensureConversation,
  listInboxThreads,
  listMessagesForConversation,
} from "@/lib/crm/inbox-service";
import { getClientIp } from "@/lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { searchParams } = new URL(request.url);
  const conversationId = String(searchParams.get("conversationId") || "").trim();
  if (conversationId) {
    return apiOk({
      messages: listMessagesForConversation(conversationId),
    }, context);
  }
  return apiOk({ conversations: listInboxThreads() }, context);
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
  const customerId = String(body.customerId || "").trim();
  const channel = String(body.channel || "email").trim();
  if (!customerId) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "customerId required", status: 400 }, context);
  const conv = ensureConversation({ customerId, channel, subject: body.subject });
  const msg = appendInboxMessage({
    conversationId: conv.id,
    customerId,
    channel,
    direction: body.direction === "out" ? "out" : "in",
    text: body.text,
    source: body.source || "admin",
    meta: body.meta,
  });
  appendAudit(AUDIT_ACTIONS.CRM_INBOX_MESSAGE_CREATE, msg.id, {
    ip: getClientIp(request),
    route: "POST /api/admin/inbox",
    requestId: context.requestId,
    meta: {
      conversationId: conv.id,
      customerId,
      channel,
      direction: msg.direction,
    },
  });
  return apiOk({ conversation: conv, message: msg }, context);
}
