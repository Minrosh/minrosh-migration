"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";

const columnHelper = createColumnHelper();

export function AuditPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((d) => {
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
    ],
    []
  );

  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p>Loading…</p>;

  return (
    <Card>
      <CardContent className="overflow-x-auto pt-6">
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
              <tr key={row.id} className="border-b border-border/60">
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
  );
}
