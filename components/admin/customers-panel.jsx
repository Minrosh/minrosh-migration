"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

const PAGE_SIZE = 20;

const TABS = ["current", "past", "prospective"];

function parseTab(value) {
  return TABS.includes(value) ? value : null;
}

function statusVariant(s) {
  if (s === "current") return "success";
  if (s === "past") return "secondary";
  return "warning";
}

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function contextualError(operation, message, fallback) {
  const detail = String(message || fallback || "Unexpected error").trim();
  return `${operation}: ${detail}`;
}

export function CustomersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [listTotal, setListTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listBusy, setListBusy] = useState(false);
  const [listError, setListError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("prospective");
  const [tab, setTab] = useState(() => parseTab(searchParams.get("tab")) || "current");
  const [detailId, setDetailId] = useState(null);
  const [plainBootstrap, setPlainBootstrap] = useState(null);
  const [marketingConsentCreate, setMarketingConsentCreate] = useState(true);
  const [createError, setCreateError] = useState("");
  const listFetchStartedRef = useRef(false);

  useEffect(() => {
    const t = parseTab(searchParams.get("tab"));
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useLayoutEffect(() => {
    setPage(0);
  }, [tab]);

  const load = useCallback(() => {
    if (!listFetchStartedRef.current) {
      listFetchStartedRef.current = true;
      setLoading(true);
    } else {
      setListBusy(true);
    }
    setListError("");
    const params = new URLSearchParams({
      status: tab,
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    if (debouncedSearch) params.set("q", debouncedSearch);
    fetch(`/api/admin/customers?${params.toString()}`)
      .then(async (r) => ({ res: r, payload: await parseJsonResponseSafe(r) }))
      .then(({ res, payload }) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        const errorMessage = payload?.error?.message || payload?.error || d?.error;
        if (!res.ok) {
          setCustomers([]);
          setListTotal(0);
          setListError(contextualError("Load customers", errorMessage, "Could not load customers."));
          return;
        }
        setCustomers(d.customers || []);
        setListTotal(typeof d.total === "number" ? d.total : 0);
      })
      .catch(() => {
        setCustomers([]);
        setListTotal(0);
        setListError(contextualError("Load customers", "", "Network error while loading customers."));
      })
      .finally(() => {
        setLoading(false);
        setListBusy(false);
      });
  }, [tab, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

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
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageStart = listTotal === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = Math.min(listTotal, (page + 1) * PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = (page + 1) * PAGE_SIZE < listTotal;

  async function createCustomer(e) {
    e.preventDefault();
    setCreateError("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, status, marketingConsent: marketingConsentCreate }),
      });
      const payload = await parseJsonResponseSafe(res);
      const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || d?.error;
      if (!res.ok) {
        setCreateError(contextualError("Create customer", errorMessage, "Could not create customer."));
        return;
      }
      setName("");
      setEmail("");
      setStatus("prospective");
      setMarketingConsentCreate(true);
      if (d.customer?.id && d.magicUploadToken) {
        setPlainBootstrap({ id: d.customer.id, token: d.magicUploadToken });
        setDetailId(d.customer.id);
      }
      load();
    } catch {
      setCreateError(contextualError("Create customer", "", "Network error while creating customer."));
    }
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
          {createError ? <p className="mt-3 text-sm text-destructive">{createError}</p> : null}
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
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base">Directory</CardTitle>
            <CardDescription>
              Filter by name or email as you type. Results are paged ({PAGE_SIZE} per page) for each status tab.
            </CardDescription>
          </div>
          <div className="w-full space-y-2 sm:w-72">
            <Label htmlFor="customers-search">Search</Label>
            <Input
              id="customers-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Name or email…"
              autoComplete="off"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {listError ? <p className="text-sm text-destructive">{listError}</p> : null}
          <div className={`relative overflow-x-auto rounded-md border border-border ${listBusy ? "opacity-60" : ""}`}>
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
                      {debouncedSearch
                        ? "No customers match this search in this tab."
                        : "No customers in this tab."}
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
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {listTotal === 0
                ? "No rows."
                : `Showing ${pageStart}–${pageEnd} of ${listTotal}`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={!canPrev || listBusy} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Previous
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={!canNext || listBusy} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
