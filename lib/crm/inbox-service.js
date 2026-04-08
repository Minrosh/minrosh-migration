import { randomUUID } from "node:crypto";
import path from "node:path";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readCrmConversationsBundle, writeCrmConversationsBundle } from "@/lib/admin/crm-store";
import { crmConversationsFile } from "@/lib/admin/paths";
import { recordInteraction } from "./record-interaction";

function lockPath() {
  return path.join(path.dirname(crmConversationsFile), ".crm-conversations.lock");
}

export function listInboxThreads() {
  const bundle = readCrmConversationsBundle();
  const conv = Array.isArray(bundle.conversations) ? bundle.conversations : [];
  return [...conv].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function listMessagesForConversation(conversationId) {
  const bundle = readCrmConversationsBundle();
  const msgs = Array.isArray(bundle.messages) ? bundle.messages : [];
  return msgs.filter((m) => m.conversationId === conversationId).sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

export function ensureConversation({ customerId, channel, subject }) {
  const cid = String(customerId || "").trim();
  const ch = String(channel || "email").slice(0, 40);
  return withMutationLock(lockPath(), () => {
    const bundle = readCrmConversationsBundle();
    const conv = Array.isArray(bundle.conversations) ? bundle.conversations : [];
    const existing = conv.find((c) => c.customerId === cid && c.channel === ch);
    if (existing) return existing;
    const at = new Date().toISOString();
    const row = {
      id: `conv-${randomUUID()}`,
      customerId: cid,
      channel: ch,
      subject: String(subject || "").slice(0, 200) || `${ch} thread`,
      updatedAt: at,
      createdAt: at,
    };
    conv.unshift(row);
    writeCrmConversationsBundle({ ...bundle, conversations: conv.slice(0, 2000) });
    return row;
  });
}

export function appendInboxMessage({ conversationId, customerId, channel, direction, text, source, meta }) {
  const at = new Date().toISOString();
  const msg = {
    id: `msg-${randomUUID()}`,
    conversationId,
    customerId: String(customerId || "").trim(),
    channel: String(channel || "").slice(0, 40),
    direction: direction === "out" ? "out" : "in",
    text: String(text || "").slice(0, 8000),
    at,
    source: String(source || "inbox").slice(0, 80),
    meta: meta && typeof meta === "object" ? meta : undefined,
  };
  withMutationLock(lockPath(), () => {
    const bundle = readCrmConversationsBundle();
    const conv = Array.isArray(bundle.conversations) ? bundle.conversations : [];
    const msgs = Array.isArray(bundle.messages) ? bundle.messages : [];
    msgs.push(msg);
    const ci = conv.findIndex((c) => c.id === conversationId);
    if (ci !== -1) {
      conv[ci] = { ...conv[ci], updatedAt: at };
    }
    writeCrmConversationsBundle({
      conversations: conv,
      messages: msgs.slice(-8000),
    });
  });
  if (msg.customerId) {
    recordInteraction({
      customerId: msg.customerId,
      type: channel === "webchat" ? "webchat" : channel === "whatsapp" ? "whatsapp" : "email",
      channel: msg.channel,
      body: msg.text.slice(0, 2000),
      meta: { conversationId, direction: msg.direction, source: msg.source },
    });
  }
  return msg;
}
