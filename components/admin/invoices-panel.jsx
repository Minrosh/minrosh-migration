"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const columnHelper = createColumnHelper();

export function InvoicesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [service, setService] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/invoices")
      .then((r) => r.json())
      .then((d) => {
        setInvoices(d.invoices || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("invoiceNumber", { header: " #" }),
      columnHelper.accessor("customerName", { header: "Customer" }),
      columnHelper.accessor("date", { header: "Date" }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (i) => `AUD ${Number(i.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor("service", { header: "Service" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (i) => (
          <Badge variant={i.getValue() === "paid" ? "success" : "warning"}>{i.getValue()}</Badge>
        ),
      }),
      columnHelper.display({
        id: "pdf",
        header: "PDF",
        cell: ({ row }) => (
          <a
            className="text-primary underline"
            href={`/api/admin/invoices/${row.original.id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Download
          </a>
        ),
      }),
      columnHelper.display({
        id: "toggle",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={async () => {
              const next = row.original.status === "paid" ? "pending" : "paid";
              await fetch("/api/admin/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "setStatus", id: row.original.id, status: next }),
              });
              load();
            }}
          >
            Mark {row.original.status === "paid" ? "pending" : "paid"}
          </Button>
        ),
      }),
    ],
    [load]
  );

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function createInvoice(e) {
    e.preventDefault();
    await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        date,
        amount: parseFloat(amount) || 0,
        service,
        status: "pending",
      }),
    });
    setCustomerName("");
    setService("");
    setAmount("");
    load();
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>New invoice</CardTitle>
          <CardDescription>Invoice number is assigned automatically (YYYY-####).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createInvoice} className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Customer name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Amount (AUD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Service</Label>
              <Input value={service} onChange={(e) => setService(e.target.value)} required />
            </div>
            <Button type="submit">Create invoice</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
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
    </div>
  );
}
