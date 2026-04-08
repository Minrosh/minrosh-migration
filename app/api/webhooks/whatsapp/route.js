import crypto from "node:crypto";
import { appendInboxMessage, ensureConversation } from "@/lib/crm/inbox-service";

function validSecret(request) {
  const expected = String(process.env.WHATSAPP_WEBHOOK_SECRET || "").trim();
  if (!expected) return false;
  const got = String(request.headers.get("x-webhook-secret") || "").trim();
  return got === expected;
}

export async function POST(request) {
  if (!validSecret(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const customerId = String(body.customerId || "").trim();
  const from = String(body.from || body.waId || "").trim();
  const text = String(body.text || body.body || "").trim();
  if (!text) return Response.json({ error: "text required" }, { status: 400 });
  const cid = customerId || `wa-${crypto.createHash("sha256").update(from).digest("hex").slice(0, 12)}`;
  const conv = ensureConversation({ customerId: cid, channel: "whatsapp", subject: `WhatsApp ${from || "thread"}` });
  const msg = appendInboxMessage({
    conversationId: conv.id,
    customerId: cid,
    channel: "whatsapp",
    direction: "in",
    text,
    source: "whatsapp_webhook",
    meta: { from },
  });
  return Response.json({ ok: true, messageId: msg.id });
}
