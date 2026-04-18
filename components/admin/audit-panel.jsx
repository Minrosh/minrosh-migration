"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const columnHelper = createColumnHelper();

/** Select value for rows with missing or blank `action` (must not collide with real action strings). */
const FILTER_MISSING_ACTION = "__audit_missing_action__";

export function AuditPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((payload) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        setEntries(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: "When",
        cell: (i) => i.getValue()?.replace("T", " ").slice(0, 19),
      }),
      columnHelper.accessor("action", { header: "Action" }),
      columnHelper.accessor("detail", { header: "Detail" }),
      columnHelper.accessor("ip", {
        header: "IP",
        cell: (i) => i.getValue() || "—",
      }),
      columnHelper.accessor("route", {
        header: "Route",
        cell: (i) => <span className="max-w-[140px] truncate block">{i.getValue() || "—"}</span>,
      }),
    ],
    []
  );

  const actionCounts = useMemo(() => {
    const m = new Map();
    for (const e of entries) {
      const raw = String(e.action ?? "").trim();
      const key = raw || FILTER_MISSING_ACTION;
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, [entries]);

  const uniqueActions = useMemo(
    () => [...actionCounts.keys()].sort((a, b) => a.localeCompare(b)),
    [actionCounts]
  );

  const filteredEntries = useMemo(() => {
    if (!actionFilter) return entries;
    if (actionFilter === FILTER_MISSING_ACTION) {
      return entries.filter((e) => !String(e.action ?? "").trim());
    }
    return entries.filter((e) => String(e.action ?? "").trim() === actionFilter);
  }, [entries, actionFilter]);

  const table = useReactTable({
    data: filteredEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>Loading events…</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTableSkeleton rows={8} cols={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Audit log</CardTitle>
          <CardDescription>
            {entries.length} event{entries.length === 1 ? "" : "s"} loaded. Narrow by action type to trace logins,
            creates, and other changes.
          </CardDescription>
        </div>
        <div className="w-full space-y-2 sm:w-72">
          <Label htmlFor="audit-action-filter">Action type</Label>
          <select
            id="audit-action-filter"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All actions</option>
            {uniqueActions.map((key) => (
              <option key={key} value={key}>
                {key === FILTER_MISSING_ACTION ? "(no action)" : key} ({actionCounts.get(key) ?? 0})
              </option>
            ))}
          </select>
        </div>
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
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  {entries.length === 0
                    ? "No audit events yet."
                    : "No events match this action filter."}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {actionFilter ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {filteredEntries.length} of {entries.length} loaded events.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
