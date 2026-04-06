"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CustomerDetailDrawer } from "@/components/admin/customer-detail-drawer";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const columnHelper = createColumnHelper();

const TABS = ["current", "past", "prospective"];

function parseTab(value) {
  return TABS.includes(value) ? value : null;
}

function statusVariant(s) {
  if (s === "current") return "success";
  if (s === "past") return "secondary";
  return "warning";
}

export function CustomersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("prospective");
  const [tab, setTab] = useState(() => parseTab(searchParams.get("tab")) || "current");
  const [detailId, setDetailId] = useState(null);
  const [plainBootstrap, setPlainBootstrap] = useState(null);
  const [marketingConsentCreate, setMarketingConsentCreate] = useState(true);

  useEffect(() => {
    const t = parseTab(searchParams.get("tab"));
    if (t) setTab(t);
  }, [searchParams]);

  const load = useCallback(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (detailId && !customers.some((c) => c.id === detailId)) {
      setDetailId(null);
    }
  }, [customers, detailId]);

  const filtered = useMemo(
    () => customers.filter((c) => c.status === tab),
    [customers, tab]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (i) => <Badge variant={statusVariant(i.getValue())}>{i.getValue()}</Badge>,
      }),
      columnHelper.display({
        id: "upload",
        header: "Upload link",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.hasMagicLink ? "Open details to copy" : "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "docs",
        header: "Docs",
        cell: ({ row }) => {
          const n = row.original.documentCount ?? 0;
          return (
            <div className="flex max-w-[200px] flex-col gap-2">
              <p className="text-sm font-medium">{n} file(s)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full"
                onClick={() => setDetailId(row.original.id)}
              >
                Open details
              </Button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function createCustomer(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, status, marketingConsent: marketingConsentCreate }),
    });
    const d = await res.json().catch(() => ({}));
    setName("");
    setEmail("");
    setStatus("prospective");
    setMarketingConsentCreate(true);
    if (d.customer?.id && d.magicUploadToken) {
      setPlainBootstrap({ id: d.customer.id, token: d.magicUploadToken });
      setDetailId(d.customer.id);
    }
    load();
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Loading directory…</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTableSkeleton rows={6} cols={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CustomerDetailDrawer
        customerId={detailId}
        open={Boolean(detailId)}
        onClose={() => {
          setDetailId(null);
          setPlainBootstrap(null);
        }}
        onRefresh={load}
        bootstrapPlainToken={plainBootstrap?.id === detailId ? plainBootstrap.token : undefined}
      />
      <Card>
        <CardHeader>
          <CardTitle>Add customer</CardTitle>
          <CardDescription>
          Magic links are stored hashed server-side. The plain URL is shown once here after create, in the details
          panel, or after &quot;New token&quot;.
        </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createCustomer} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bucket</Label>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="current">Current</option>
                <option value="past">Past</option>
                <option value="prospective">Prospective</option>
              </select>
            </div>
            <label className="flex max-w-md cursor-pointer items-start gap-2 text-sm leading-snug text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border border-input"
                checked={marketingConsentCreate}
                onChange={(e) => setMarketingConsentCreate(e.target.checked)}
              />
              <span>Include in marketing / prospective broadcasts (recommended for new enquiries).</span>
            </label>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          router.replace(`/admin/customers?tab=${encodeURIComponent(v)}`, { scroll: false });
        }}
      >
        <TabsList>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="prospective">Prospective</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="mt-4">
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-muted-foreground">
                    No customers in this tab.
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
        </CardContent>
      </Card>
    </div>
  );
}
