"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

export function WebsiteCompliancePanel() {
  const [form, setForm] = useState({
    showMarn: false,
    marnText: "Available on request",
    disclaimerText: "",
    noGuaranteeText: "",
    assessmentDisclaimer: "",
    footerComplianceWording: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/website/compliance", { cache: "no-store" });
    const payload = await parseJsonResponseSafe(res);
    const data = payload?.data?.compliance || payload?.compliance;
    if (data) {
      setForm({
        showMarn: Boolean(data.showMarn),
        marnText: data.marnText || "Available on request",
        disclaimerText: data.disclaimerText || "",
        noGuaranteeText: data.noGuaranteeText || "",
        assessmentDisclaimer: data.assessmentDisclaimer || "",
        footerComplianceWording: data.footerComplianceWording || "",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setMessage("");
    const res = await fetch("/api/admin/website/compliance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, updatedBy: "admin" }),
    });
    const payload = await parseJsonResponseSafe(res);
    if (!res.ok) {
      setMessage(payload?.error?.message || "Save failed");
      return;
    }
    setMessage("Saved to data/website-compliance.json");
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.showMarn)}
          onChange={(e) => setForm({ ...form, showMarn: e.target.checked })}
        />
        Show MARN publicly
      </label>
      {[
        ["marnText", "MARN text"],
        ["disclaimerText", "Disclaimer"],
        ["noGuaranteeText", "No guarantee text"],
        ["assessmentDisclaimer", "Assessment disclaimer"],
        ["footerComplianceWording", "Footer compliance wording"],
      ].map(([key, label]) => (
        <div key={key}>
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            value={form[key] || ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <Button type="button" onClick={save}>
        Save compliance settings
      </Button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
