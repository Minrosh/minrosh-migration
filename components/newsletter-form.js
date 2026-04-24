"use client";

import { useRef, useState } from "react";
import { retryAfterHint } from "@/lib/http/retry-after";
import { REQUEST_ID_HEADER } from "@/lib/observability/request-id";

function validateNewsletterForm(form) {
  const errors = {};
  const email = String(form.email || "").trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.marketingConsent) {
    errors.marketingConsent = "Please confirm consent before subscribing.";
  }
  return errors;
}

function mapNewsletterErrorMessage(errorCode, fallbackMessage) {
  if (errorCode === "RATE_LIMITED") {
    return "Too many subscribe attempts in a short time. Please wait a few minutes and try again.";
  }
  if (errorCode === "VALIDATION_FAILED") {
    return fallbackMessage || "Please review your email and consent selection, then try again.";
  }
  if (errorCode === "AUTH_UNAUTHORIZED") {
    return "Your session has expired. Please refresh the page and try again.";
  }
  if (errorCode === "AUTH_FORBIDDEN") {
    return "This action is not allowed right now. Please contact support if you need help.";
  }
  if (errorCode === "CONFLICT") {
    return fallbackMessage || "This request conflicts with recent activity. Please try again in a moment.";
  }
  if (errorCode === "INTERNAL_ERROR" || errorCode === "UPSTREAM_ERROR") {
    return "We are having trouble completing your subscription right now. Please try again shortly.";
  }
  return fallbackMessage || "Could not subscribe right now.";
}

export function NewsletterForm({ onSubscribed }) {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const hpRef = useRef(null);
  const emailRef = useRef(null);
  const consentRef = useRef(null);

  function clearFieldError(name) {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    if (status.type === "error") {
      setStatus((current) => ({ ...current, message: "" }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateNewsletterForm({ email, marketingConsent });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields before subscribing.",
      });
      const firstInvalidField = Object.keys(errors)[0];
      if (firstInvalidField === "email" && emailRef.current) {
        emailRef.current.focus();
      } else if (firstInvalidField === "marketingConsent" && consentRef.current) {
        consentRef.current.focus();
      }
      return;
    }
    setStatus({ type: "loading", message: "" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          marketingConsent,
          company: hpRef.current?.value || "",
        }),
      });
      const rawText = await response.text();
      let payload;
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch {
        const requestId = String(response.headers.get(REQUEST_ID_HEADER) || "").trim();
        const withRequestId = (message) =>
          requestId ? `${message} (Ref: ${requestId})` : message;
        setStatus({
          type: "error",
          message:
            response.status >= 500
              ? withRequestId("The server returned an unexpected reply. Please try again in a moment.")
              : withRequestId("We could not read the server response. Please refresh and try again."),
        });
        return;
      }
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const err = payload?.error;
      const requestId = typeof payload?.requestId === "string" ? payload.requestId.trim() : "";
      const errorCode =
        typeof err === "object" && err != null && typeof err.code === "string" ? err.code : "";
      const retryHint = errorCode === "RATE_LIMITED" ? retryAfterHint(response.headers.get("retry-after")) : "";
      const errorMessage =
        (typeof err === "object" && err != null && typeof err.message === "string" ? err.message : null) ||
        (typeof err === "string" ? err : null) ||
        (typeof data?.error === "string" ? data.error : null);
      const withRequestId = (message) =>
        requestId ? `${message} (Ref: ${requestId})` : message;
      if (!response.ok || !(payload?.ok ?? data?.ok)) {
        throw new Error(withRequestId(`${mapNewsletterErrorMessage(errorCode, errorMessage)}${retryHint}`));
      }

      if (!data.exists) {
        onSubscribed?.();
      }

      setStatus({ type: "success", message: data.message });
      setEmail("");
      setMarketingConsent(false);
      setFieldErrors({});
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not subscribe right now." });
    }
  }

  return (
    <>
      <form className="site-footer__newsletter-form" onSubmit={handleSubmit}>
        <div className="site-footer__newsletter-form__email">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            ref={emailRef}
            id="footer-newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            placeholder="Your email address"
            required
            autoComplete="email"
            aria-invalid={fieldErrors.email ? "true" : undefined}
            aria-describedby={fieldErrors.email ? "newsletter-err-email" : undefined}
          />
          {fieldErrors.email ? (
            <p id="newsletter-err-email" className="field-error" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <label className="site-footer__newsletter-consent" htmlFor="footer-newsletter-consent">
          <input
            ref={consentRef}
            id="footer-newsletter-consent"
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => {
              setMarketingConsent(e.target.checked);
              clearFieldError("marketingConsent");
            }}
            required
            aria-invalid={fieldErrors.marketingConsent ? "true" : undefined}
            aria-describedby={fieldErrors.marketingConsent ? "newsletter-err-consent" : undefined}
          />
          <span>
            I agree to receive marketing emails about visas and migration updates. I can unsubscribe at any time (see
            our privacy policy).
          </span>
        </label>
        {fieldErrors.marketingConsent ? (
          <p id="newsletter-err-consent" className="field-error" role="alert">
            {fieldErrors.marketingConsent}
          </p>
        ) : null}

        <div className="site-footer__newsletter-form__actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status.type === "loading" || !marketingConsent}
          >
            {status.type === "loading" ? "Joining..." : "Subscribe"}
          </button>
        </div>

        <input
          ref={hpRef}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
        />
      </form>
      {status.message ? (
        <p
          className={`form-feedback is-${status.type === "success" ? "success" : "error"}`}
          role={status.type === "error" ? "alert" : "status"}
          aria-live={status.type === "error" ? "assertive" : "polite"}
        >
          {status.message}
        </p>
      ) : null}
    </>
  );
}
