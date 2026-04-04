"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export function SuccessStoriesPanel() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    location: "",
    visa: "",
    quote: "",
    outcome: "",
    timeline: "",
  });

  const load = useCallback(() => {
    fetch("/api/admin/success-stories")
      .then((r) => r.json())
      .then((d) => {
        setStories(d.stories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addStory(e) {
    e.preventDefault();
    await fetch("/api/admin/success-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", location: "", visa: "", quote: "", outcome: "", timeline: "" });
    load();
  }

  async function removeAt(index) {
    if (!confirm("Remove this story?")) return;
    await fetch("/api/admin/success-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", index }),
    });
    load();
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Success stories</CardTitle>
            <CardDescription>Loading published stories…</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTableSkeleton rows={4} cols={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add story</CardTitle>
          <CardDescription>Fields mirror the public success story cards.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addStory} className="grid max-w-2xl gap-4 sm:grid-cols-2">
            {["name", "location", "visa", "timeline"].map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field}</Label>
                <Input
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={field === "name"}
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label>Quote</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Outcome</Label>
              <Input
                value={form.outcome}
                onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
              />
            </div>
            <Button type="submit">Save story</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved ({stories.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stories.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:justify-between">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.visa}</p>
                <p className="mt-2 text-sm italic">&ldquo;{s.quote?.slice(0, 120)}…&rdquo;</p>
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={() => removeAt(i)}>
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
