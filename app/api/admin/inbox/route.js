import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import {
  appendInboxMessage,
  ensureConversation,
  listInboxThreads,
  listMessagesForConversation,
} from "@/lib/crm/inbox-service";

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
  const conversationId = String(searchParams.get("conversationId") || "").trim();
  if (conversationId) {
    return Response.json({
      messages: listMessagesForConversation(conversationId),
    });
  }
  return Response.json({ conversations: listInboxThreads() });
}

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const customerId = String(body.customerId || "").trim();
  const channel = String(body.channel || "email").trim();
  if (!customerId) return Response.json({ error: "customerId required" }, { status: 400 });
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
  return Response.json({ conversation: conv, message: msg });
}
