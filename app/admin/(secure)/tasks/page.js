"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/tasks?openOnly=1")
      .then((r) => r.json())
      .then((payload) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        setTasks(d.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function done(id) {
    await fetch("/api/admin/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "done" }),
    });
    load();
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Tasks</h1>
        <AdminTableSkeleton rows={5} cols={3} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Tasks</h1>
      <p className="mb-8 text-muted-foreground">Open tasks from automations and manual creation.</p>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No open tasks</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          tasks.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
                <CardTitle className="text-sm font-medium">{t.title}</CardTitle>
                <Button type="button" size="sm" variant="secondary" onClick={() => done(t.id)}>
                  Done
                </Button>
              </CardHeader>
              <CardContent className="pb-3 text-xs text-muted-foreground">
                {t.customerId} · {t.source} · due {t.dueAt?.slice(0, 10) || "—"}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
