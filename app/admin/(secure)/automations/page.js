"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AutomationsPage() {
  const [rules, setRules] = useState([]);
  const [raw, setRaw] = useState("[]");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/automations")
      .then((r) => r.json())
      .then((d) => {
        const rulesJson = JSON.stringify(d.rules || [], null, 2);
        setRules(d.rules || []);
        setRaw(rulesJson);
      });
  }, []);

  async function save() {
    setMsg("");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setMsg("Invalid JSON");
      return;
    }
    const res = await fetch("/api/admin/automations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: parsed }),
    });
    if (!res.ok) {
      setMsg("Save failed");
      return;
    }
    setMsg("Saved.");
    setRules(parsed);
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Automations</h1>
      <p className="mb-8 text-muted-foreground">
        Rule definitions in <code className="rounded bg-muted px-1">data/crm-automations.json</code>. Cron:{" "}
        <code className="rounded bg-muted px-1">POST /api/cron/crm-automation</code> with same secret as nurture (or{" "}
        <code className="rounded bg-muted px-1">CRM_AUTOMATION_CRON_SECRET</code>).
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rules (JSON)</CardTitle>
          <CardDescription>Triggers: lead_created, stage_unchanged_days. Actions: create_task.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-[280px] w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
          <Button type="button" onClick={save}>
            Save rules
          </Button>
          <p className="text-xs text-muted-foreground">Current rule count: {rules.length}</p>
        </CardContent>
      </Card>
    </div>
  );
}
