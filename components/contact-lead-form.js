"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  clearNavigatorSummarySession,
  quizSummaryFromNavigatorDetail,
  readNavigatorQuizSummaryLine,
} from "@/lib/navigator-session";
import { trackEvent } from "@/lib/client-analytics";
import { retryAfterHint } from "@/lib/http/retry-after";
import { REQUEST_ID_HEADER } from "@/lib/observability/request-id";
import { HCaptchaField } from "./hcaptcha-field";

const CAPTCHA_ENABLED =
  String(process.env.NEXT_PUBLIC_ENABLE_HCAPTCHA || "").toLowerCase() === "true" &&
  Boolean(String(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "").trim());

function validateLeadForm(form, mode) {
  /** @type {Record<string, string>} */
  const errors = {};
  if (!String(form.firstName || "").trim()) {
    errors.firstName = "Please enter your first name.";
  }
  const email = String(form.email || "").trim();
  const phone = String(form.phone || "").trim();
  const phoneDigits = phone.replace(/\D/g, "");

  if (!email && !phoneDigits) {
    errors.email = "Please provide an email or phone number so we can respond.";
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (phoneDigits && phoneDigits.length < 8) {
    errors.phone = "Please check your phone number.";
  }

  const message = String(form.message || "").trim();
  if (!message) {
    errors.message = "Please describe your situation.";
  } else if (message.length < 5) {
    errors.message = "Please provide a brief description.";
  }
  
  if (mode === "consultation") {
    if (!String(form.preferredDate || "").trim()) {
      errors.preferredDate = "Please choose a preferred date.";
    }
    if (!String(form.preferredTime || "").trim()) {
      errors.preferredTime = "Please choose a preferred time.";
    }
    if (!String(form.bookingType || "").trim()) {
      errors.bookingType = "Please choose consultation type.";
    }
  }
  if (!form.privacyPolicyAccepted) {
    errors.privacyPolicyAccepted = "Please confirm you have read the Privacy Policy before submitting.";
  }
  if (CAPTCHA_ENABLED && !String(form.hCaptchaToken || "").trim()) {
    errors.hCaptchaToken = "Please complete the captcha verification.";
  }
  return errors;
}

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredCountry: "Australia",
  mainNeed: "Skilled Migration",
  preferredDate: "",
  preferredTime: "",
  consultationDurationMins: "45",
  bookingType: "video",
  consultationOffer: "first_15_free",
  timeZone: "Australia/Brisbane",
  message: "",
  privacyPolicyAccepted: false,
  hCaptchaToken: "",
  referralSource: "",
  referralCode: "",
  utmSource: "",
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

function mapContactErrorMessage(errorCode, fallbackMessage) {
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

export function ContactLeadForm({ className = "", mode = "general" }) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [quizSummaryLine, setQuizSummaryLine] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileStepper, setMobileStepper] = useState(false);
  const formRef = useRef(null);
  const hpRef = useRef(null);

  const stepFieldGroups =
    mode === "consultation"
      ? [
          ["firstName", "lastName", "email", "phone"],
          ["preferredCountry", "mainNeed", "preferredDate", "preferredTime", "consultationDurationMins", "timeZone"],
          ["bookingType", "consultationOffer"],
          ["message", "privacyPolicyAccepted"],
        ]
      : [
          ["firstName", "lastName", "email", "phone"],
          ["preferredCountry", "mainNeed"],
          ["message", "privacyPolicyAccepted"],
        ];

  const visibleFields = mobileStepper ? new Set(stepFieldGroups[currentStep] || []) : null;

  useEffect(() => {
    setQuizSummaryLine(readNavigatorQuizSummaryLine());
  }, []);

  useEffect(() => {
    const fromCity = String(searchParams.get("fromCity") || "").trim();
    const pathwayGoal = String(searchParams.get("pathwayGoal") || "").trim();
    const ref = String(searchParams.get("ref") || "").trim();
    const refCode = String(searchParams.get("ref_code") || "").trim();
    const utmSource = String(searchParams.get("utm_source") || "").trim();
    if (!fromCity && !pathwayGoal && !ref && !refCode && !utmSource) return;
    setForm((current) => ({
      ...current,
      preferredCountry: "Australia",
      mainNeed: mode === "consultation" ? "Student Pathway" : current.mainNeed,
      message:
        fromCity || pathwayGoal
          ? `Pathway map prefill:\nFrom city: ${fromCity || "Sri Lanka"}\nGoal: ${
              pathwayGoal || "Australia pathway"
            }\n\n${current.message}`.trim()
          : current.message,
      referralSource: ref || current.referralSource,
      referralCode: refCode || current.referralCode,
      utmSource: utmSource || current.utmSource,
    }));
  }, [searchParams, mode]);

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
  }, [mode, mobileStepper]);

  useEffect(() => {
    function handleNavigatorSummary(event) {
      const detail = event.detail;
      if (!detail?.summary && !detail?.quizSummaryShort) return;

      const line = quizSummaryFromNavigatorDetail(detail);
      if (line) {
        setQuizSummaryLine(line);
      }

      if (detail.summary) {
        setForm((current) => {
          const cleaned = current.message.replace(/\n\nAssessment summary:[\s\S]*$/m, "").trim();
          const summaryBlock = `Assessment summary: ${detail.summary}`;
          return {
            ...current,
            preferredCountry: detail.preferredCountry || current.preferredCountry,
            mainNeed: detail.mainNeed || current.mainNeed,
            message: cleaned ? `${cleaned}\n\n${summaryBlock}` : summaryBlock,
          };
        });
      }
    }

    window.addEventListener("minrosh:navigator-summary", handleNavigatorSummary);
    return () =>
      window.removeEventListener("minrosh:navigator-summary", handleNavigatorSummary);
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  function floatingField(label, name, inputEl, error, errorId) {
    return (
      <label className={error ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has(name)}>
        <span className="sr-only">{label}</span>
        <div className="relative">
          {inputEl}
          <span className="pointer-events-none absolute left-3 top-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-plum/60">
            {label}
          </span>
        </div>
        {error ? (
          <span className="field-error" id={errorId} role="alert">
            {error}
          </span>
        ) : null}
      </label>
    );
  }

  function stepErrorsFor(stepIndex) {
    const allErrors = validateLeadForm(form, mode);
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
    const errors = validateLeadForm(form, mode);
    const errorEntries = Object.entries(errors);
    setFieldErrors(errors);
    if (errorEntries.length > 0) {
      const firstErrorField = errorEntries[0][0];
      if (mobileStepper) {
        const stepIndex = stepFieldGroups.findIndex((group) => group.includes(firstErrorField));
        if (stepIndex >= 0) setCurrentStep(stepIndex);
      }
      focusFieldByName(firstErrorField);
      trackEvent("contact_form_validation_error", { form_mode: mode, fields: Object.keys(errors).join(",") });
      return;
    }

    trackEvent("contact_form_submit_attempt", {
      form_mode: mode,
      preferred_country: form.preferredCountry,
      main_need: form.mainNeed,
      has_quiz_summary: Boolean(quizSummaryLine),
    });
    setState({ status: "loading", message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          privacyPolicyAccepted: Boolean(form.privacyPolicyAccepted),
          company: hpRef.current?.value || "",
          quizSummary: quizSummaryLine,
          hCaptchaToken: String(form.hCaptchaToken || "").trim(),
          referralSource: String(form.referralSource || "").trim(),
          referralCode: String(form.referralCode || "").trim(),
          utmSource: String(form.utmSource || "").trim(),
          bookingType: String(form.bookingType || "video").trim(),
          consultationOffer: String(form.consultationOffer || "first_15_free").trim(),
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
              ? withRequestId("The server returned an unexpected reply (not JSON). Please try again shortly, or phone or email us.")
              : withRequestId("We could not read the server response. Please refresh the page and try again, or contact us directly."),
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
        throw new Error(withRequestId(`${mapContactErrorMessage(errorCode, errorMessage)}${retryHint}`));
      }
      const syncNote = processingSummaryNote(data.processing);
      setState({
        status: "success",
        message: data.consultationBooked
          ? `Consultation booked successfully.${data.meetUrl ? ` Meet link: ${data.meetUrl}` : ""}${data.checkoutUrl ? ` Secure payment: ${data.checkoutUrl}` : ""}${syncNote}`
          : (data.warning || "Your enquiry has been received. We will review it and respond shortly.") + syncNote,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("minrosh:enquiry-created"));
      }
      trackEvent("contact_form_submit_success", {
        form_mode: mode,
        consultation_booked: Boolean(data.consultationBooked),
        preferred_country: form.preferredCountry,
        main_need: form.mainNeed,
      });
      setForm(initialForm);
      setFieldErrors({});
      setQuizSummaryLine("");
      clearNavigatorSummarySession();
    } catch (error) {
      trackEvent("contact_form_submit_error", {
        form_mode: mode,
        error_message: String(error?.message || "unknown_error").slice(0, 120),
      });
      setState({
        status: "error",
        message: error.message || "Could not submit enquiry.",
      });
    }
  }

  return (
    <form ref={formRef} className={`contact-form bento-hover ${className}`.trim()} onSubmit={handleSubmit}>
      <div className="mb-8 border-b border-brand-plum/5 pb-6">
        <h3 className="text-2xl font-black text-brand-plum mb-2">Send an enquiry</h3>
        <p className="text-sm text-brand-plum/60 font-medium mb-4">Our team triages submissions within 1 business day.</p>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-brand-rose/5 px-3 py-1.5 rounded-full border border-brand-rose/10">
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-rose">4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-gold/5 px-3 py-1.5 rounded-full border border-brand-gold/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold">Fast Response</span>
          </div>
        </div>
      </div>

      <p className="form-security-note">
        Submissions use HTTPS in transit. See our{" "}
        <a href="/privacy-policy" className="text-primary underline">
          Privacy Policy
        </a>{" "}
        for how we handle personal information.
      </p>
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
      <div className="contact-grid">
        {floatingField(
          "First name",
          "firstName",
          <input
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            required
            className="pt-7"
            aria-invalid={fieldErrors.firstName ? "true" : undefined}
            aria-describedby={fieldErrors.firstName ? "err-firstName" : undefined}
          />,
          fieldErrors.firstName,
          "err-firstName"
        )}
        <label hidden={mobileStepper && !visibleFields?.has("lastName")}>
          <span>Last name</span>
          <input
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
          />
        </label>
        {floatingField(
          "Email",
          "email",
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            className="pt-7"
            aria-invalid={fieldErrors.email ? "true" : undefined}
            aria-describedby={fieldErrors.email ? "err-email" : undefined}
          />,
          fieldErrors.email,
          "err-email"
        )}
        <label className={fieldErrors.phone ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("phone")}>
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            aria-invalid={fieldErrors.phone ? "true" : undefined}
            aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
          />
          {fieldErrors.phone ? (
            <span className="field-error" id="err-phone" role="alert">
              {fieldErrors.phone}
            </span>
          ) : null}
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("preferredCountry")}>
          <span>Preferred country</span>
          <select name="preferredCountry" value={form.preferredCountry} onChange={handleChange}>
            <option value="">Not sure yet</option>
            <option>Australia</option>
            <option>New Zealand</option>
            <option>Canada</option>
            <option>United Kingdom</option>
          </select>
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("mainNeed")}>
          <span>Main need</span>
          <select name="mainNeed" value={form.mainNeed} onChange={handleChange}>
            <option value="">Not sure yet</option>
            <option>Skilled Migration</option>
            <option>Partner Visa</option>
            <option>Student Visa</option>
            <option>Student Pathway</option>
            <option>Employer-Sponsored</option>
            <option>Family / Complex Case</option>
            <option>General Enquiry</option>
          </select>
        </label>
        {mode === "consultation" ? (
          <>
            <label
              className={fieldErrors.preferredDate ? "has-error" : ""}
              hidden={mobileStepper && !visibleFields?.has("preferredDate")}
            >
              <span>Preferred date</span>
              <input
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                required
                aria-invalid={fieldErrors.preferredDate ? "true" : undefined}
                aria-describedby={fieldErrors.preferredDate ? "err-preferredDate" : undefined}
              />
              {fieldErrors.preferredDate ? (
                <span className="field-error" id="err-preferredDate" role="alert">
                  {fieldErrors.preferredDate}
                </span>
              ) : null}
            </label>
            <label
              className={fieldErrors.preferredTime ? "has-error" : ""}
              hidden={mobileStepper && !visibleFields?.has("preferredTime")}
            >
              <span>Preferred time</span>
              <input
                type="time"
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                required
                aria-invalid={fieldErrors.preferredTime ? "true" : undefined}
                aria-describedby={fieldErrors.preferredTime ? "err-preferredTime" : undefined}
              />
              {fieldErrors.preferredTime ? (
                <span className="field-error" id="err-preferredTime" role="alert">
                  {fieldErrors.preferredTime}
                </span>
              ) : null}
            </label>
            <label hidden={mobileStepper && !visibleFields?.has("consultationDurationMins")}>
              <span>Consultation length</span>
              <select
                name="consultationDurationMins"
                value={form.consultationDurationMins}
                onChange={handleChange}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>
            <label hidden={mobileStepper && !visibleFields?.has("timeZone")}>
              <span>Time zone</span>
              <select name="timeZone" value={form.timeZone} onChange={handleChange}>
                <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                <option value="Asia/Colombo">Asia/Colombo (Sri Lanka)</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </label>
            <label className={fieldErrors.bookingType ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("bookingType")}>
              <span>Consultation type</span>
              <select
                name="bookingType"
                value={form.bookingType}
                onChange={handleChange}
                aria-invalid={fieldErrors.bookingType ? "true" : undefined}
                aria-describedby={fieldErrors.bookingType ? "err-bookingType" : undefined}
              >
                <option value="video">Video consultation (Google Meet)</option>
                <option value="phone">Phone consultation</option>
                <option value="in_person">In-person consultation</option>
              </select>
              {fieldErrors.bookingType ? (
                <span className="field-error" id="err-bookingType" role="alert">
                  {fieldErrors.bookingType}
                </span>
              ) : null}
            </label>
            <label hidden={mobileStepper && !visibleFields?.has("consultationOffer")}>
              <span>Consultation offer</span>
              <select name="consultationOffer" value={form.consultationOffer} onChange={handleChange}>
                <option value="first_15_free">First 15 minutes free</option>
                <option value="standard">Standard consultation</option>
              </select>
            </label>
          </>
        ) : null}
        <div 
          className={`contact-grid__full${fieldErrors.message ? " has-error" : ""}`}
          hidden={mobileStepper && !visibleFields?.has("message")}
        >
          <label className="block mb-2">
            <span>Your enquiry</span>
            <textarea
              name="message"
              rows="6"
              autoComplete="off"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your situation, timeline, and the visa pathway you want to explore."
              required
              aria-invalid={fieldErrors.message ? "true" : undefined}
              aria-describedby={fieldErrors.message ? "err-message" : undefined}
            />
          </label>
          {quizSummaryLine ? (
            <div className="mb-4 p-3 rounded-lg bg-brand-rose/5 border border-brand-rose/10 text-[10px] sm:text-xs font-medium text-brand-rose flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5">ℹ️</span>
              <p>We included your quiz summary for convenience; you can edit or remove it from the text area above.</p>
            </div>
          ) : null}
          {fieldErrors.message ? (
            <span className="field-error" id="err-message" role="alert">
              {fieldErrors.message}
            </span>
          ) : (
            <span className="contact-form__hint">Just a sentence or two helps us triage your enquiry.</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-8">
        <label
          className={`flex items-start gap-3 text-sm p-4 rounded-xl border border-brand-plum/5 bg-brand-plum/[0.02] cursor-pointer hover:bg-brand-plum/[0.04] transition-colors${fieldErrors.privacyPolicyAccepted ? " has-error border-red-200 bg-red-50" : ""}`}
          hidden={mobileStepper && !visibleFields?.has("privacyPolicyAccepted")}
        >
          <input
            type="checkbox"
            name="privacyPolicyAccepted"
            checked={Boolean(form.privacyPolicyAccepted)}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-brand-plum/20 text-brand-rose focus:ring-brand-rose"
            aria-invalid={fieldErrors.privacyPolicyAccepted ? "true" : undefined}
            aria-describedby={fieldErrors.privacyPolicyAccepted ? "err-privacyPolicyAccepted" : undefined}
          />
          <span className="text-xs font-medium text-brand-plum/70 leading-relaxed">
            I have read the{" "}
            <a href="/privacy-policy" className="text-brand-rose underline font-bold" onClick={(e) => e.stopPropagation()}>
              Privacy Policy
            </a>{" "}
            and agree you may use my details to respond to this enquiry. Submissions use HTTPS encryption.
          </span>
        </label>
        {fieldErrors.privacyPolicyAccepted ? (
          <p className="field-error -mt-4 px-4" id="err-privacyPolicyAccepted" role="alert">
            {fieldErrors.privacyPolicyAccepted}
          </p>
        ) : null}

        {mobileStepper && currentStep < stepFieldGroups.length - 1 ? null : (
          <HCaptchaField
            value={form.hCaptchaToken}
            onTokenChange={(token) => {
              const normalized = String(token || "").trim();
              setForm((current) => ({ ...current, hCaptchaToken: normalized }));
              if (normalized) {
                setFieldErrors((current) => {
                  if (!current.hCaptchaToken) return current;
                  const next = { ...current };
                  delete next.hCaptchaToken;
                  return next;
                });
              }
            }}
            error={fieldErrors.hCaptchaToken || ""}
          />
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="btn btn-primary w-full py-5 text-lg font-black shadow-xl hover:-translate-y-1 transition-all"
          disabled={state.status === "loading"}
        >
          {state.status === "loading"
            ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
                Sending your plan...
              </>
            )
            : mobileStepper && currentStep < stepFieldGroups.length - 1
              ? "Continue to next step"
              : mode === "consultation" ? "Confirm Booking" : "Start your journey"}
        </motion.button>
      </div>

      {mobileStepper ? (
        <div className="contact-form__step-actions mt-4 flex items-center justify-between">
          <button
            type="button"
            className="text-xs font-bold text-brand-plum/40 hover:text-brand-rose transition-colors"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || state.status === "loading"}
          >
            ← Previous step
          </button>
          {currentStep < stepFieldGroups.length - 1 ? (
            <button
              type="button"
              className="btn btn-ghost py-3 px-6 text-sm"
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
