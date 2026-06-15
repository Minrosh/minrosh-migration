"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/** ISO-style country hint for GST (AU = 10% in invoice engine). */
export function billToCountryForGst(hit) {
  if (!hit) return "AU";
  const raw = String(hit.country || "").trim();
  if (!raw) return "AU";
  if (/australia|^au$/i.test(raw)) return "AU";
  if (raw.length === 2) return raw.toUpperCase();
  return "AU";
}

/**
 * Searchable CRM customer picker (plain Input + list; no extra UI deps).
 * @param {{ label?: string, customers: object[], value: string, onChange: (id: string) => void, required?: boolean }} props
 */
export function InvoiceCustomerPicker({ label, customers, value, onChange, required }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  const selected = useMemo(() => customers.find((c) => c.id === value), [customers, value]);

  useEffect(() => {
    function onDocDown(e) {
      if (!root.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = Array.isArray(customers) ? customers : [];
    if (!t) return list.slice(0, 100);
    return list
      .filter((c) => {
        const blob = [c.id, c.name, c.email, c.company, c.mobile].map((x) => String(x || "").toLowerCase()).join(" ");
        return blob.includes(t);
      })
      .slice(0, 100);
  }, [customers, q]);

  return (
    <div className="space-y-2 sm:col-span-2" ref={root}>
      <Label>
        {label || "Customer (CRM)"}
        {required ? " *" : ""}
      </Label>
      {selected ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="font-medium">{selected.name || selected.id}</span>
          {selected.email ? <span className="text-muted-foreground">{selected.email}</span> : null}
          <span className="text-xs text-muted-foreground">({selected.id})</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto h-8"
            onClick={() => {
              onChange("");
              setQ("");
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <>
          <Input
            placeholder="Search by name, email, phone, company, or customer ID…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="invoice-customer-picker-list"
            autoComplete="off"
          />
          {open && filtered.length > 0 ? (
            <ul
              id="invoice-customer-picker-list"
              className="max-h-56 overflow-auto rounded-md border border-border bg-card text-card-foreground shadow-md"
              role="listbox"
            >
              {filtered.map((c) => (
                <li key={c.id} role="none">
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 border-b border-border/60 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                    onClick={() => {
                      onChange(c.id);
                      setQ("");
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium">{c.name || "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {[c.email, c.mobile].filter(Boolean).join(" · ") || c.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : open && q.trim() && filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground">No customers match this search.</p>
          ) : null}
        </>
      )}
    </div>
  );
}
