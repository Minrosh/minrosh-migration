"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { retryAfterHint } from "@/lib/http/retry-after";
import { REQUEST_ID_HEADER } from "@/lib/observability/request-id";

function validateUnsubscribeToken(value) {
  const token = String(value || "").trim();
  if (!token) return "Please paste the unsubscribe token from your email.";
  if (token.length < 12) return "This token looks too short. Please copy the full token from your email link.";
  return "";
}

function mapUnsubscribeErrorMessage(errorCode, fallbackMessage) {
  if (errorCode === "RATE_LIMITED") {
    return "Too many unsubscribe attempts right now. Please wait a few minutes, then try again.";
  }
  if (errorCode === "VALIDATION_FAILED") {
    return fallbackMessage || "Please check your unsubscribe token and try again.";
  }
  if (errorCode === "AUTH_UNAUTHORIZED") {
    return "Your session has expired. Please refresh the page and try again.";
  }
  if (errorCode === "AUTH_FORBIDDEN") {
    return "This action is not allowed right now. Please contact support if you need help.";
  }
  if (errorCode === "CONFLICT") {
    return fallbackMessage || "This unsubscribe request conflicts with recent activity. Please try again in a moment.";
  }
  if (errorCode === "INTERNAL_ERROR" || errorCode === "UPSTREAM_ERROR") {
    return "We are having trouble completing this unsubscribe request right now. Please try again shortly.";
  }
  return fallbackMessage || "Could not process request.";
}

export function NewsletterUnsubscribeClient() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [tokenError, setTokenError] = useState("");
  const [tokenPrefilled, setTokenPrefilled] = useState(false);
  const autoSubmitDoneRef = useRef(false);
  const tokenInputRef = useRef(null);

  const executeUnsubscribe = useCallback(async (rawToken) => {
    const normalizedToken = String(rawToken || "").trim();
    const validationError = validateUnsubscribeToken(normalizedToken);
    setTokenError(validationError);
    if (validationError) {
      setStatus({ type: "error", message: "Please fix the highlighted field before submitting." });
      if (tokenInputRef.current && typeof tokenInputRef.current.focus === "function") {
        tokenInputRef.current.focus();
      }
      return;
    }
    setStatus({ type: "loading", message: "" });
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: normalizedToken }),
      });
      const rawText = await res.text();
      let payload;
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch {
        const requestId = String(res.headers.get(REQUEST_ID_HEADER) || "").trim();
        const withRequestId = (message) =>
          requestId ? `${message} (Ref: ${requestId})` : message;
        setStatus({
          type: "error",
          message:
            res.status >= 500
              ? withRequestId("The server returned an unexpected reply. Please try again shortly.")
              : withRequestId("We could not read the server response. Please refresh and try again."),
        });
        return;
      }
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const err = payload?.error;
      const requestId = typeof payload?.requestId === "string" ? payload.requestId.trim() : "";
      const errorCode =
        typeof err === "object" && err != null && typeof err.code === "string" ? err.code : "";
      const retryHint = errorCode === "RATE_LIMITED" ? retryAfterHint(res.headers.get("retry-after")) : "";
      const errorMessage =
        (typeof err === "object" && err != null && typeof err.message === "string" ? err.message : null) ||
        (typeof err === "string" ? err : null) ||
        (typeof data?.error === "string" ? data.error : null);
      const withRequestId = (message) =>
        requestId ? `${message} (Ref: ${requestId})` : message;
      if (!res.ok || !(payload?.ok ?? data?.ok ?? res.ok)) {
        setStatus({
          type: "error",
          message: withRequestId(`${mapUnsubscribeErrorMessage(errorCode, errorMessage)}${retryHint}`),
        });
        return;
      }
      setStatus({ type: "success", message: data.message || "Unsubscribed." });
      setToken("");
      setTokenError("");
    } catch {
      setStatus({ type: "error", message: "Network error. Please check your connection and try again." });
    }
  }, []);

  useEffect(() => {
    const tokenFromUrl = String(searchParams.get("token") || "").trim();
    if (!tokenFromUrl) return;
    setToken((current) => (current ? current : tokenFromUrl));
    setTokenPrefilled(true);
    if (autoSubmitDoneRef.current) return;
    autoSubmitDoneRef.current = true;
    void executeUnsubscribe(tokenFromUrl);
  }, [searchParams, executeUnsubscribe]);

  const isBusy = status.type === "loading";

  async function submit(e) {
    e.preventDefault();
    await executeUnsubscribe(token);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
      <label className="block text-sm font-medium">
        Unsubscribe token (from your email link)
        <input
          ref={tokenInputRef}
          className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            if (tokenError) setTokenError("");
            if (status.type === "error") {
              setStatus((current) => ({ ...current, message: "" }));
            }
          }}
          placeholder="Paste token"
          autoComplete="off"
          disabled={isBusy}
          aria-invalid={tokenError ? "true" : undefined}
          aria-describedby={tokenError ? "newsletter-unsubscribe-token-error" : undefined}
        />
        {tokenError ? (
          <p id="newsletter-unsubscribe-token-error" className="mt-2 text-sm text-destructive" role="alert">
            {tokenError}
          </p>
        ) : tokenPrefilled ? (
          <p className="mt-2 text-sm text-muted-foreground">Token loaded from your unsubscribe link.</p>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={isBusy || !token.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isBusy ? "Processing unsubscribe…" : "Unsubscribe"}
      </button>
      {isBusy ? <p className="text-sm text-muted-foreground">We are processing your unsubscribe request now.</p> : null}
      {status.message ? (
        <p
          className={`text-sm ${status.type === "success" ? "text-green-700" : "text-destructive"}`}
          role={status.type === "success" ? "status" : "alert"}
          aria-live={status.type === "success" ? "polite" : "assertive"}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
