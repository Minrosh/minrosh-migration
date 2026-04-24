"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearNavigatorSummarySession,
  quizSummaryFromNavigatorDetail,
  readNavigatorQuizSummaryLine,
} from "@/lib/navigator-session";
import { retryAfterHint } from "@/lib/http/retry-after";
import { REQUEST_ID_HEADER } from "@/lib/observability/request-id";
import trustSignalsData from "../data/quick-enquiry-signals.json";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredCountry: "Australia",
  mainNeed: "General Enquiry",
  message: "",
  privacyPolicyAccepted: false,
};

function processingSummaryNote(processing) {
  if (!processing || typeof processing !== "object") return "";
  const labels = {
    driveFolder: "Drive folder",
    supabaseDualWrite: "Supabase sync",
    crmLeadCapture: "CRM sync",
    sheetSync: "Sheet sync",
  };
  const failed = Object.entries(processing)
    .filter(([, status]) => status === "failed")
    .map(([key]) => labels[key] || key);
  return failed.length ? ` Background sync pending: ${failed.join(", ")}.` : "";
}

function mapQuickEnquiryErrorMessage(errorCode, fallbackMessage) {
  if (errorCode === "RATE_LIMITED") {
    return "Too many submissions in a short time. Please wait a few minutes and try again.";
  }
  if (errorCode === "VALIDATION_FAILED") {
    return fallbackMessage || "Please review your details and submit again.";
  }
  if (errorCode === "AUTH_UNAUTHORIZED") {
    return "Your session has expired. Please refresh the page and try again.";
  }
  if (errorCode === "AUTH_FORBIDDEN") {
    return "This action is not allowed right now. Please contact support if you need help.";
  }
  if (errorCode === "CONFLICT") {
    return fallbackMessage || "This request conflicts with recent activity. Please review and try again.";
  }
  if (errorCode === "INTERNAL_ERROR" || errorCode === "UPSTREAM_ERROR") {
    return "We are having trouble completing your request right now. Please try again shortly.";
  }
  return fallbackMessage || "Could not submit enquiry.";
}

function validateQuickEnquiry(form) {
  const errors = {};
  if (!String(form.firstName || "").trim()) {
    errors.firstName = "Please enter your first name.";
  }
  const phoneDigits = String(form.phone || "").replace(/\D/g, "");
  if (phoneDigits.length < 8) {
    errors.phone = "Please enter a valid phone number so we can follow up.";
  }
  const email = String(form.email || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address or leave it blank.";
  }
  const message = String(form.message || "").trim();
  if (!message) {
    errors.message = "Please share a short summary of your situation.";
  } else if (message.length < 20) {
    errors.message = "A little more detail helps us triage your enquiry faster.";
  }
  if (!form.privacyPolicyAccepted) {
    errors.privacyPolicyAccepted = "Please confirm you have read the Privacy Policy before submitting.";
  }
  return errors;
}

export function QuickEnquiryForm({ className = "" }) {
  const [form, setForm] = useState(initial);
  const [quizSummaryLine, setQuizSummaryLine] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [mobileStepper, setMobileStepper] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const hpRef = useRef(null);
  const trustSignals = Array.isArray(trustSignalsData?.trustSignals) ? trustSignalsData.trustSignals : [];

  const stepFieldGroups = [
    ["firstName", "lastName", "phone", "email"],
    ["preferredCountry", "mainNeed", "message", "privacyPolicyAccepted"],
  ];
  const visibleFields = mobileStepper ? new Set(stepFieldGroups[currentStep] || []) : null;

  useEffect(() => {
    setQuizSummaryLine(readNavigatorQuizSummaryLine());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(max-width: 720px)");
    const sync = () => setMobileStepper(query.matches);
    sync();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }
    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  useEffect(() => {
    setCurrentStep(0);
  }, [mobileStepper]);

  useEffect(() => {
    function handleNavigatorSummary(event) {
      const detail = event.detail;
      if (!detail?.summary && !detail?.quizSummaryShort) return;
      const line = quizSummaryFromNavigatorDetail(detail);
      if (line) setQuizSummaryLine(line);
    }
    window.addEventListener("minrosh:navigator-summary", handleNavigatorSummary);
    return () => window.removeEventListener("minrosh:navigator-summary", handleNavigatorSummary);
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((c) => ({ ...c, [name]: type === "checkbox" ? checked : value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    if (state.status === "error") {
      setState((current) => ({ ...current, message: "" }));
    }
  }

  function stepErrorsFor(stepIndex) {
    const allErrors = validateQuickEnquiry(form);
    const fields = new Set(stepFieldGroups[stepIndex] || []);
    return Object.fromEntries(Object.entries(allErrors).filter(([field]) => fields.has(field)));
  }

  function handleNextStep() {
    const errors = stepErrorsFor(currentStep);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      setState({
        status: "error",
        message: "Please complete the highlighted fields before continuing.",
      });
      const firstInvalidField = Object.keys(errors)[0];
      if (firstInvalidField && typeof document !== "undefined") {
        const el = document.querySelector(`[name="${firstInvalidField}"]`);
        if (el && typeof el.focus === "function") {
          el.focus();
        }
      }
      return;
    }
    if (state.status === "error" && state.message) {
      setState((current) => ({ ...current, message: "" }));
    }
    setCurrentStep((prev) => Math.min(stepFieldGroups.length - 1, prev + 1));
  }

  function focusFieldByName(fieldName) {
    if (!fieldName || typeof document === "undefined") return;
    const focusTarget = () => {
      const el = document.querySelector(`[name="${fieldName}"]`);
      if (el && typeof el.focus === "function") {
        el.focus();
      }
    };
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(focusTarget);
      return;
    }
    focusTarget();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (mobileStepper && currentStep < stepFieldGroups.length - 1) {
      handleNextStep();
      return;
    }
    const errors = validateQuickEnquiry(form);
    const errorEntries = Object.entries(errors);
    setFieldErrors(errors);
    if (errorEntries.length > 0) {
      const firstErrorField = errorEntries[0][0];
      if (mobileStepper) {
        const stepIndex = stepFieldGroups.findIndex((group) => group.includes(firstErrorField));
        if (stepIndex >= 0) setCurrentStep(stepIndex);
      }
      focusFieldByName(firstErrorField);
      setState({
        status: "error",
        message: "Please fix the highlighted fields before submitting.",
      });
      return;
    }
    setState({ status: "loading", message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          privacyPolicyAccepted: true,
          quickEnquiry: true,
          company: hpRef.current?.value || "",
          quizSummary: quizSummaryLine,
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
        setState({
          status: "error",
          message:
            response.status >= 500
              ? withRequestId("The server returned an unexpected reply (not JSON). Please try again shortly.")
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
        throw new Error(withRequestId(`${mapQuickEnquiryErrorMessage(errorCode, errorMessage)}${retryHint}`));
      }
      const syncNote = processingSummaryNote(data.processing);
      setState({
        status: "success",
        message:
          (data.warning || "Thanks — we have your message and will follow up by phone or WhatsApp shortly.") +
          syncNote,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("minrosh:enquiry-created"));
      }
      setForm(initial);
      setFieldErrors({});
      setQuizSummaryLine("");
      clearNavigatorSummarySession();
    } catch (error) {
      setState({
        status: "error",
        message: error.message || "Could not submit enquiry.",
      });
    }
  }

  return (
    <form className={`contact-form bento-hover quick-enquiry-form ${className}`.trim()} onSubmit={handleSubmit}>
      {mobileStepper ? (
        <div className="contact-form__stepper" aria-live="polite">
          <p className="contact-form__stepper-label">
            Step {currentStep + 1} of {stepFieldGroups.length}
          </p>
          <div className="contact-form__stepper-progress" aria-hidden="true">
            <span
              className="contact-form__stepper-progress-bar"
              style={{ width: `${((currentStep + 1) / stepFieldGroups.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      <p className="section-label">Quick enquiry</p>
      <p className="quick-enquiry-form__hint">
        No email required — share your phone and a short message. Add email if you want a brochure copy.
      </p>
      <p className="form-security-note">
        This form is sent over HTTPS. Only share what you are comfortable including in an initial enquiry; you can add
        detail after we respond.
      </p>
      {trustSignals.length ? (
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          {trustSignals.map((item) => (
            <div key={item.id} className="rounded-xl border border-brand-plum/15 bg-white px-3 py-2">
              <p className="text-sm font-bold text-brand-plum">{item.value}</p>
              <p className="text-xs text-brand-plum/70">{item.label}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="contact-grid">
        <label className={fieldErrors.firstName ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("firstName")}>
          <span>First name</span>
          <input
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.firstName ? "true" : undefined}
            aria-describedby={fieldErrors.firstName ? "quick-err-firstName" : undefined}
          />
          {fieldErrors.firstName ? (
            <span className="field-error" id="quick-err-firstName" role="alert">
              {fieldErrors.firstName}
            </span>
          ) : null}
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("lastName")}>
          <span>Last name</span>
          <input
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
          />
        </label>
        <label className={fieldErrors.phone ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("phone")}>
          <span>Phone (required)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.phone ? "true" : undefined}
            aria-describedby={fieldErrors.phone ? "quick-err-phone" : undefined}
          />
          {fieldErrors.phone ? (
            <span className="field-error" id="quick-err-phone" role="alert">
              {fieldErrors.phone}
            </span>
          ) : null}
        </label>
        <label className={fieldErrors.email ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("email")}>
          <span>Email (optional)</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            aria-invalid={fieldErrors.email ? "true" : undefined}
            aria-describedby={fieldErrors.email ? "quick-err-email" : undefined}
          />
          {fieldErrors.email ? (
            <span className="field-error" id="quick-err-email" role="alert">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("preferredCountry")}>
          <span>Preferred country</span>
          <select name="preferredCountry" value={form.preferredCountry} onChange={handleChange}>
            <option>Australia</option>
            <option>New Zealand</option>
            <option>Canada</option>
            <option>United Kingdom</option>
          </select>
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("mainNeed")}>
          <span>Main need</span>
          <select name="mainNeed" value={form.mainNeed} onChange={handleChange}>
            <option>General Enquiry</option>
            <option>Skilled Migration</option>
            <option>Student Visa</option>
            <option>Partner Visa</option>
            <option>Employer-Sponsored</option>
            <option>Student Pathway</option>
            <option>Family / Complex Case</option>
          </select>
        </label>
        <label className={`contact-grid__full${fieldErrors.message ? " has-error" : ""}`} hidden={mobileStepper && !visibleFields?.has("message")}>
          <span>Your message</span>
          <textarea
            name="message"
            rows="4"
            autoComplete="off"
            value={form.message}
            onChange={handleChange}
            placeholder="e.g. occupation, years of experience, and whether you are in Sri Lanka or already offshore."
            required
            aria-invalid={fieldErrors.message ? "true" : undefined}
            aria-describedby={fieldErrors.message ? "quick-err-message" : undefined}
          />
          {fieldErrors.message ? (
            <span className="field-error" id="quick-err-message" role="alert">
              {fieldErrors.message}
            </span>
          ) : null}
        </label>
      </div>
      <label
        className={`contact-grid__full flex items-start gap-2 text-sm${fieldErrors.privacyPolicyAccepted ? " has-error" : ""}`}
        hidden={mobileStepper && !visibleFields?.has("privacyPolicyAccepted")}
      >
        <input
          type="checkbox"
          name="privacyPolicyAccepted"
          checked={Boolean(form.privacyPolicyAccepted)}
          onChange={handleChange}
          className="mt-1"
          aria-invalid={fieldErrors.privacyPolicyAccepted ? "true" : undefined}
          aria-describedby={fieldErrors.privacyPolicyAccepted ? "quick-err-privacyPolicyAccepted" : undefined}
        />
        <span>
          I have read the{" "}
          <a href="/privacy-policy" className="text-primary underline">
            Privacy Policy
          </a>{" "}
          and agree you may use my details to respond.
        </span>
      </label>
      {fieldErrors.privacyPolicyAccepted ? (
        <p className="field-error contact-grid__full" id="quick-err-privacyPolicyAccepted" role="alert">
          {fieldErrors.privacyPolicyAccepted}
        </p>
      ) : null}
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
      <button type="submit" className="btn btn-primary" disabled={state.status === "loading"}>
        {state.status === "loading"
          ? "Sending..."
          : mobileStepper && currentStep < stepFieldGroups.length - 1
            ? "Continue"
            : "Send quick enquiry"}
      </button>
      {mobileStepper ? (
        <div className="contact-form__step-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || state.status === "loading"}
          >
            Back
          </button>
          {currentStep < stepFieldGroups.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={state.status === "loading"}
            >
              Next step
            </button>
          ) : null}
        </div>
      ) : null}
      {state.message ? (
        <p
          className={`form-feedback is-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
          aria-live={state.status === "error" ? "assertive" : "polite"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
