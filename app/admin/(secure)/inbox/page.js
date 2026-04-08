"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [text, setText] = useState("");

  function loadThreads() {
    fetch("/api/admin/inbox")
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    fetch(`/api/admin/inbox?conversationId=${encodeURIComponent(activeId)}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []));
  }, [activeId]);

  async function sendOut() {
    if (!customerId.trim() || !text.trim()) return;
    await fetch("/api/admin/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId.trim(),
        channel: "email",
        direction: "out",
        text: text.trim(),
        subject: "Admin message",
      }),
    });
    setText("");
    loadThreads();
    if (activeId) {
      const r = await fetch(`/api/admin/inbox?conversationId=${encodeURIComponent(activeId)}`);
      const d = await r.json();
      setMessages(d.messages || []);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Inbox</h1>
        <AdminTableSkeleton rows={5} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Unified threads (email / WhatsApp / webchat). Storage:{" "}
          <code className="rounded bg-muted px-1">data/crm-conversations.json</code>.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Threads</CardTitle>
            <CardDescription>Select a conversation to load messages.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {conversations.length === 0 ? (
              <p className="text-muted-foreground">No threads yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left ${activeId === c.id ? "border-primary bg-muted" : "border-border"}`}
                  onClick={() => setActiveId(c.id)}
                >
                  <span className="font-medium">{c.subject}</span>
                  <span className="block text-xs text-muted-foreground">
                    {c.channel} · {c.customerId}
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[320px] space-y-2 overflow-y-auto text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-md border p-2 ${m.direction === "out" ? "ml-4 border-primary/40" : "mr-4"}`}
              >
                <span className="text-xs text-muted-foreground">
                  {m.direction} · {m.at?.slice(0, 19)}
                </span>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send outbound (logged)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="inbox-cust">Customer ID</Label>
            <Input id="inbox-cust" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="cust-…" />
          </div>
          <div className="flex-[2] space-y-2">
            <Label htmlFor="inbox-text">Message</Label>
            <Input id="inbox-text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <Button type="button" onClick={sendOut}>
            Log outbound
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
