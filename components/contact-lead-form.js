"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  clearNavigatorSummarySession,
  quizSummaryFromNavigatorDetail,
  readNavigatorQuizSummaryLine,
} from "@/lib/navigator-session";
import { trackEvent } from "@/lib/client-analytics";

function validateLeadForm(form, mode) {
  /** @type {Record<string, string>} */
  const errors = {};
  if (!String(form.firstName || "").trim()) {
    errors.firstName = "Please enter your first name.";
  }
  const email = String(form.email || "").trim();
  if (!email) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  const message = String(form.message || "").trim();
  if (!message) {
    errors.message = "Please describe your situation so we can respond usefully.";
  } else if (message.length < 24) {
    errors.message = "A little more detail (at least one or two sentences) helps us triage your enquiry.";
  }
  const phone = String(form.phone || "").trim();
  if (phone && phone.replace(/\D/g, "").length < 8) {
    errors.phone = "Please check your phone number, or leave it blank.";
  }
  if (mode === "consultation") {
    if (!String(form.preferredDate || "").trim()) {
      errors.preferredDate = "Please choose a preferred date.";
    }
    if (!String(form.preferredTime || "").trim()) {
      errors.preferredTime = "Please choose a preferred time.";
    }
  }
  if (!form.privacyPolicyAccepted) {
    errors.privacyPolicyAccepted = "Please confirm you have read the Privacy Policy before submitting.";
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
  timeZone: "Australia/Brisbane",
  message: "",
  privacyPolicyAccepted: false,
};

export function ContactLeadForm({ className = "", mode = "general" }) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [quizSummaryLine, setQuizSummaryLine] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileStepper, setMobileStepper] = useState(false);
  const hpRef = useRef(null);

  const stepFieldGroups =
    mode === "consultation"
      ? [
          ["firstName", "lastName", "email", "phone"],
          ["preferredCountry", "mainNeed", "preferredDate", "preferredTime", "consultationDurationMins", "timeZone"],
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
    if (!fromCity && !pathwayGoal) return;
    setForm((current) => ({
      ...current,
      preferredCountry: "Australia",
      mainNeed: mode === "consultation" ? "Student Pathway" : current.mainNeed,
      message: `Pathway map prefill:\nFrom city: ${fromCity || "Sri Lanka"}\nGoal: ${pathwayGoal || "Australia pathway"}\n\n${current.message}`.trim(),
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
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (mobileStepper && currentStep < stepFieldGroups.length - 1) {
      setCurrentStep((prev) => Math.min(stepFieldGroups.length - 1, prev + 1));
      return;
    }
    const errors = validateLeadForm(form, mode);
    const errorEntries = Object.entries(errors);
    setFieldErrors(errors);
    if (errorEntries.length > 0) {
      if (mobileStepper) {
        const firstErrorField = errorEntries[0][0];
        const stepIndex = stepFieldGroups.findIndex((group) => group.includes(firstErrorField));
        if (stepIndex >= 0) setCurrentStep(stepIndex);
      }
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
        }),
      });
      const payload = await response.json();
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || data?.error;
      if (!response.ok || !(payload?.ok ?? data?.ok)) {
        throw new Error(errorMessage || "Could not submit enquiry.");
      }
      setState({
        status: "success",
        message: data.consultationBooked
          ? `Consultation booked successfully.${data.meetUrl ? ` Meet link: ${data.meetUrl}` : ""}`
          : data.warning || "Your enquiry has been received. We will review it and respond shortly.",
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
    <form className={`contact-form bento-hover ${className}`.trim()} onSubmit={handleSubmit}>
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
        <label className={fieldErrors.firstName ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("firstName")}>
          <span>First name</span>
          <input
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.firstName ? "true" : undefined}
            aria-describedby={fieldErrors.firstName ? "err-firstName" : undefined}
          />
          {fieldErrors.firstName ? (
            <span className="field-error" id="err-firstName" role="alert">
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
        <label className={fieldErrors.email ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("email")}>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            aria-invalid={fieldErrors.email ? "true" : undefined}
            aria-describedby={fieldErrors.email ? "err-email" : undefined}
          />
          {fieldErrors.email ? (
            <span className="field-error" id="err-email" role="alert">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>
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
            <option>Australia</option>
            <option>New Zealand</option>
            <option>Canada</option>
            <option>United Kingdom</option>
          </select>
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("mainNeed")}>
          <span>Main need</span>
          <select name="mainNeed" value={form.mainNeed} onChange={handleChange}>
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
          </>
        ) : null}
        <label
          className={`contact-grid__full${fieldErrors.message ? " has-error" : ""}`}
          hidden={mobileStepper && !visibleFields?.has("message")}
        >
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
          {fieldErrors.message ? (
            <span className="field-error" id="err-message" role="alert">
              {fieldErrors.message}
            </span>
          ) : (
            <span className="contact-form__hint">Most people write at least a short paragraph (about 25+ characters).</span>
          )}
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
        />
        <span>
          I have read the{" "}
          <a href="/privacy-policy" className="text-primary underline">
            Privacy Policy
          </a>{" "}
          and agree you may use my details to respond to this enquiry.
        </span>
      </label>
      {fieldErrors.privacyPolicyAccepted ? (
        <p className="field-error contact-grid__full" role="alert">
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
            : "Submit enquiry"}
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
              onClick={() => setCurrentStep((prev) => Math.min(stepFieldGroups.length - 1, prev + 1))}
              disabled={state.status === "loading"}
            >
              Next step
            </button>
          ) : null}
        </div>
      ) : null}
      {state.message ? (
        <p className={`form-feedback is-${state.status}`} role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
