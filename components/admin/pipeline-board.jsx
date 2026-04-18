"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OPPORTUNITY_STAGES } from "@/lib/crm/opportunity-stages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const stageLabels = {
  new: "New",
  qualified: "Qualified",
  consult_booked: "Consult booked",
  docs_pending: "Docs pending",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
};

export function PipelineBoard() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/opportunities")
      .then((r) => r.json())
      .then((payload) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        setOpportunities(d.opportunities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byStage = useMemo(() => {
    const m = {};
    for (const s of OPPORTUNITY_STAGES) m[s] = [];
    for (const o of opportunities) {
      const st = OPPORTUNITY_STAGES.includes(o.stage) ? o.stage : "new";
      m[st].push(o);
    }
    return m;
  }, [opportunities]);

  async function moveToStage(opp, newStage) {
    setMsg("");
    const res = await fetch("/api/admin/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: opp.id, stage: newStage, expectedVersion: opp.version }),
    });
    const data = await res.json().catch(() => ({}));
    const payload = data;
    const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const errorMessage = payload?.error?.message || payload?.error || body?.error;
    if (!res.ok) {
      setMsg(errorMessage || "Could not update stage");
      load();
      return;
    }
    load();
  }

  function onDragStart(e, opp) {
    setDragId(opp.id);
    e.dataTransfer.setData("application/json", JSON.stringify(opp));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function onDrop(e, stage) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    let opp;
    try {
      opp = JSON.parse(raw);
    } catch {
      return;
    }
    if (opp.stage === stage) return;
    await moveToStage(opp, stage);
    setDragId(null);
  }

  if (loading) {
    return <AdminTableSkeleton rows={4} cols={4} />;
  }

  return (
    <div className="space-y-4">
      {msg ? <p className="text-sm text-destructive">{msg}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {OPPORTUNITY_STAGES.map((stage) => (
          <Card
            key={stage}
            className="min-h-[200px] bg-muted/30"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, stage)}
          >
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-semibold">
                {stageLabels[stage] || stage}{" "}
                <span className="text-muted-foreground">({byStage[stage].length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {byStage[stage].map((opp) => (
                <div
                  key={opp.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, opp)}
                  className={`cursor-grab rounded-md border border-border bg-card p-2 text-xs shadow-sm active:cursor-grabbing ${
                    dragId === opp.id ? "opacity-60" : ""
                  }`}
                >
                  <p className="font-medium leading-snug">{opp.title || opp.id}</p>
                  <p className="text-muted-foreground">#{opp.version} · {opp.customerId?.slice(0, 12)}…</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {OPPORTUNITY_STAGES.filter((s) => s !== stage).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px]"
                        onClick={() => moveToStage(opp, s)}
                      >
                        → {stageLabels[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Drag cards between columns or use the quick move buttons. Conflicts refresh from the server (version mismatch).
      </p>
    </div>
  );
}
