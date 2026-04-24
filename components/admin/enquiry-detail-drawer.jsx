"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function enquiryFullName(e) {
  if (!e) return "";
  return [e.firstName, e.lastName].filter(Boolean).join(" ").trim();
}

function FieldBlock({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="text-sm">{children}</div>
    </div>
  );
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

export function EnquiryDetailDrawer({ enquiry, open, onClose, onConverted }) {
  const [convertBusy, setConvertBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!open) {
      setFeedback("");
      setConvertBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const convertToCustomer = useCallback(async () => {
    if (!enquiry) return;
    const name = enquiryFullName(enquiry) || "Prospective client";
    const email = String(enquiry.email || "").trim();
    if (!email) {
      setFeedback(
        contextualError("Convert enquiry", "", "This enquiry has no email — add one before converting.")
      );
      return;
    }
    setConvertBusy(true);
    setFeedback("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          status: "prospective",
          marketingConsent: true,
        }),
      });
      const data = await parseJsonResponseSafe(res);
      const payload = data;
      const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || body?.error || payload?.hint;
      if (!res.ok) {
        setFeedback(contextualError("Convert enquiry", errorMessage, "Could not create customer."));
        setConvertBusy(false);
        return;
      }
      const customerId = body.customer?.id;
      const phone = String(enquiry.phone || "").trim();
      let phoneSyncWarning = "";
      if (customerId && phone) {
        const patchRes = await fetch("/api/admin/customers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: customerId, mobile: phone }),
        }).catch(() => null);
        if (patchRes) {
          const patchPayload = await parseJsonResponseSafe(patchRes);
          const patchBody =
            patchPayload?.data && typeof patchPayload.data === "object" ? patchPayload.data : patchPayload;
          const patchError =
            patchPayload?.error?.message || patchPayload?.error || patchBody?.error || patchPayload?.hint;
          if (!patchRes.ok) {
            phoneSyncWarning = patchError || "Phone copy did not complete.";
          }
        } else {
          phoneSyncWarning = "Phone copy did not complete.";
        }
      }
      setFeedback(
        phoneSyncWarning
          ? `Customer record created successfully. ${contextualError("Convert enquiry", phoneSyncWarning)}`
          : "Customer record created successfully."
      );
      if (typeof onConverted === "function") await onConverted(body.customer);
    } catch {
      setFeedback(contextualError("Convert enquiry", "", "Network error while creating customer."));
    }
    setConvertBusy(false);
  }, [enquiry, onConverted]);

  if (!open || !enquiry) return null;

  const title = enquiryFullName(enquiry) || enquiry.email || "Enquiry";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-drawer-title"
    >
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close panel" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="enquiry-drawer-title" className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {enquiry.createdAt ? String(enquiry.createdAt).slice(0, 19).replace("T", " ") : "—"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <FieldBlock label="Email">
            {enquiry.email ? (
              <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${enquiry.email}`}>
                {enquiry.email}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </FieldBlock>
          <FieldBlock label="Phone">
            {enquiry.phone ? (
              <a className="text-primary underline-offset-4 hover:underline" href={`tel:${enquiry.phone}`}>
                {enquiry.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </FieldBlock>
          <FieldBlock label="Preferred country">
            {enquiry.preferredCountry ? (
              <span>{enquiry.preferredCountry}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </FieldBlock>
          <FieldBlock label="Main need">
            {enquiry.mainNeed ? <span>{enquiry.mainNeed}</span> : <span className="text-muted-foreground">—</span>}
          </FieldBlock>
          <FieldBlock label="Message">
            {enquiry.message ? (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 p-3 font-sans text-xs leading-relaxed">
                {enquiry.message}
              </pre>
            ) : (
              <span className="text-muted-foreground">No message</span>
            )}
          </FieldBlock>
          <FieldBlock label="Quiz summary">
            {enquiry.quizSummary ? (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 p-3 font-sans text-xs leading-relaxed">
                {enquiry.quizSummary}
              </pre>
            ) : (
              <span className="text-muted-foreground">No quiz summary</span>
            )}
          </FieldBlock>
        </div>

        <div className="border-t border-border p-5">
          {feedback ? (
            <p
              className={`mb-3 text-sm ${feedback.includes("successfully") ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
              role="status"
            >
              {feedback}
            </p>
          ) : null}
          <Button type="button" className="w-full sm:w-auto" disabled={convertBusy} onClick={convertToCustomer}>
            {convertBusy ? "Creating…" : "Convert to customer"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Creates a prospective customer with this name and email. If a phone number is present, it is copied to the
            customer mobile field.
          </p>
        </div>
      </aside>
    </div>
  );
}
