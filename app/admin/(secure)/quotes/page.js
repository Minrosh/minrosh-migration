"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");

  function load() {
    fetch("/api/admin/quotes")
      .then((r) => r.json())
      .then((d) => {
        setQuotes(d.quotes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId.trim(),
        customerName: customerName.trim(),
        lines: [{ description: "Professional services", amount: Number(amount) || 0 }],
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      }),
    });
    setAmount("");
    load();
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Quotes</h1>
        <AdminTableSkeleton rows={4} cols={2} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Quotes</h1>
        <p className="text-muted-foreground">PDF export per quote. Data: data/crm-quotes.json</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New quote</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-1">
            <Label>Customer ID</Label>
            <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="cust-…" />
          </div>
          <div className="space-y-1">
            <Label>Display name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Amount (AUD)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          </div>
          <Button type="button" onClick={create}>
            Create
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {quotes.map((q) => (
          <Card key={q.id}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 py-3">
              <CardTitle className="text-sm">
                {q.quoteNumber} — {q.customerName}
              </CardTitle>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={`/api/admin/quotes/${encodeURIComponent(q.id)}/pdf`} target="_blank" rel="noreferrer">
                  PDF
                </a>
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
