"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const EMPTY_FORM = {
  name: "",
  location: "",
  visa: "",
  quote: "",
  outcome: "",
  timeline: "",
};

export function SuccessStoriesPanel() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingIndex, setEditingIndex] = useState(null);

  const load = useCallback(() => {
    fetch("/api/admin/success-stories")
      .then((r) => r.json())
      .then((payload) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        setStories(d.stories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingIndex(null);
  }

  function beginEdit(index) {
    const s = stories[index];
    if (!s) return;
    setEditingIndex(index);
    setForm({
      name: s.name ?? "",
      location: s.location ?? "",
      visa: s.visa ?? "",
      quote: s.quote ?? "",
      outcome: s.outcome ?? "",
      timeline: s.timeline ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitStory(e) {
    e.preventDefault();
    if (editingIndex !== null) {
      const res = await fetch("/api/admin/success-stories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: editingIndex, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      const payload = data;
      const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || body?.error;
      if (!res.ok) {
        window.alert(errorMessage || "Could not update story.");
        return;
      }
    } else {
      const res = await fetch("/api/admin/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        window.alert(payload?.error?.message || payload?.error || body?.error || "Could not save story.");
        return;
      }
    }
    resetForm();
    load();
  }

  async function removeAt(index) {
    if (!confirm("Remove this story?")) return;
    const res = await fetch("/api/admin/success-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", index }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      window.alert(payload?.error?.message || payload?.error || body?.error || "Could not remove story.");
      return;
    }
    resetForm();
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

  const isEditing = editingIndex !== null;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit story" : "Add story"}</CardTitle>
          <CardDescription>
            {isEditing
              ? `Updating entry #${editingIndex + 1}. Submit to save changes, or cancel to discard.`
              : "Fields mirror the public success story cards."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitStory} className="grid max-w-2xl gap-4 sm:grid-cols-2">
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
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">{isEditing ? "Update story" : "Save story"}</Button>
              {isEditing ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved ({stories.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stories.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:justify-between ${
                editingIndex === i ? "border-primary ring-1 ring-primary/30" : "border-border"
              }`}
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.visa}</p>
                <p className="mt-2 text-sm italic">&ldquo;{s.quote?.slice(0, 120)}…&rdquo;</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <Button type="button" variant="outline" size="sm" onClick={() => beginEdit(i)}>
                  Edit
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeAt(i)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
