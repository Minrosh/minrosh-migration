"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { scoreLeadPriority, isHotGreenSkilledLead } from "@/lib/admin/lead-priority";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const columnHelper = createColumnHelper();

function priorityBadgeVariant(band) {
  if (band === "hot") return "default";
  if (band === "warm") return "secondary";
  return "outline";
}

export function CrmPanel() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("Update from MinRosh Migration");
  const [text, setText] = useState("");
  const [sendMsg, setSendMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/enquiries")
      .then((r) => r.json())
      .then((d) => {
        setEnquiries(d.enquiries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", { header: "Received", cell: (i) => i.getValue()?.slice(0, 19) || "—" }),
      columnHelper.accessor("firstName", {
        header: "Name",
        cell: (i) => {
          const row = i.row.original;
          return [row.firstName, row.lastName].filter(Boolean).join(" ") || "—";
        },
      }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("mainNeed", { header: "Need" }),
      columnHelper.accessor("preferredCountry", { header: "Country" }),
      columnHelper.display({
        id: "priority",
        header: "Lead priority (1–100)",
        cell: ({ row }) => {
          const { score, band, hint } = scoreLeadPriority(row.original);
          return (
            <div className="flex max-w-[150px] flex-col gap-1">
              <Badge variant={priorityBadgeVariant(band)} title={hint}>
                {score} · {band}
              </Badge>
              <span className="text-xs text-muted-foreground leading-snug">{hint}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "hot",
        header: "Signals",
        cell: ({ row }) => {
          const hot = isHotGreenSkilledLead(row.original);
          if (!hot) return <span className="text-muted-foreground">—</span>;
          return (
            <Badge variant="default" className="whitespace-nowrap bg-amber-600 hover:bg-amber-600">
              Hot · Green sector · 90+ pts
            </Badge>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: enquiries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function sendBroadcast() {
    setSendMsg("");
    const payload = { subject, text };
    let res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let d = await res.json();
    if (res.status === 409 && d.needsBroadcastConfirmation) {
      const ok = window.confirm(
        `This broadcast goes to ${d.recipientCount} prospective contacts. Send anyway?`
      );
      if (!ok) {
        setSendMsg("Large broadcast cancelled.");
        return;
      }
      res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, broadcastConfirmed: true }),
      });
      d = await res.json();
    }
    if (!res.ok) setSendMsg(d.error || d.hint || "Failed");
    else setSendMsg(`Sent to ${d.sent} prospective contact(s).`);
  }

  if (loading) {
    return (
      <div className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Enquiries</CardTitle>
            <CardDescription>Loading latest submissions…</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTableSkeleton rows={7} cols={7} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Enquiries</CardTitle>
          <CardDescription>
            Latest submissions first. <strong>Lead priority</strong> blends indicative quiz points (when present in the
            message or summary) with stacked occupation-demand keywords (healthcare, trades, education, digital, etc.),
            capped so scores stay on a 1–100 scale. Rows with <strong>Hot · Green sector · 90+ pts</strong> are skilled
            leads at 90+ points with healthcare, teaching, or trades signals only.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b text-left">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="p-2 font-semibold">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-border/60 ${isHotGreenSkilledLead(row.original) ? "bg-amber-50/80 dark:bg-amber-950/25" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email prospective customers</CardTitle>
          <CardDescription>
            Sends one message with BCC to every customer marked <strong>Prospective</strong> in Customers.
            Requires SMTP env vars.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message (plain text)</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button type="button" onClick={sendBroadcast}>
            Send BCC broadcast
          </Button>
          {sendMsg ? <p className="text-sm text-muted-foreground">{sendMsg}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
