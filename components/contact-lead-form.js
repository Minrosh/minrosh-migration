"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  clearNavigatorSummarySession,
  quizSummaryFromNavigatorDetail,
  readNavigatorQuizSummaryLine,
} from "@/lib/navigator-session";
import { validateConsultationSlot } from "@/lib/consultation-slot-policy";
import { trackEvent } from "@/lib/client-analytics";
import { retryAfterHint } from "@/lib/http/retry-after";
import { REQUEST_ID_HEADER } from "@/lib/observability/request-id";
import { isHcaptchaPublicEnabled } from "@/lib/config";
import { HCaptchaField } from "./hcaptcha-field";
import { isValidEmailClient } from "@/lib/validation/email-client";
import { MAX_CONTACT_MESSAGE_CHARS } from "@/lib/validation/contact-schema";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";
import { DEFAULT_COMPLIANCE } from "@/lib/compliance";
import { mainNeedFromEnquiryType } from "@/lib/validation/contact-schema";

const CAPTCHA_ENABLED = isHcaptchaPublicEnabled();

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
  } else if (email && !isValidEmailClient(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (phoneDigits && phoneDigits.length < 8) {
    errors.phone = "Please check your phone number.";
  }

  const enquiryType = String(form.enquiryType || "").trim();
  if (enquiryType !== "general_information" && enquiryType !== "education_enquiry") {
    errors.enquiryType = "Please choose an enquiry type.";
  }

  const message = String(form.message || "").trim();
  if (!message) {
    errors.message = "Please describe your general information or education enquiry.";
  } else if (message.length < 5) {
    errors.message = "Please provide a brief description.";
  } else if (message.length > MAX_CONTACT_MESSAGE_CHARS) {
    errors.message = `Please shorten your message (maximum ${MAX_CONTACT_MESSAGE_CHARS} characters).`;
  }
  
  if (mode === "consultation") {
    if (!String(form.preferredDate || "").trim()) {
      errors.preferredDate = "Please choose a preferred date.";
    }
    if (!String(form.preferredTime || "").trim()) {
      errors.preferredTime = "Please choose a preferred time.";
    } else if (String(form.preferredDate || "").trim()) {
      const slot = validateConsultationSlot({
        preferredDate: String(form.preferredDate || "").trim(),
        preferredTime: String(form.preferredTime || "").trim(),
        timeZone: String(form.timeZone || "Australia/Brisbane").trim(),
        slotDurationMins: Number(String(form.consultationDurationMins || "30").trim()) || 30,
      });
      if (!slot.ok) {
        errors.preferredTime = slot.error;
      }
    }
    if (!String(form.bookingType || "").trim()) {
      errors.bookingType = "Please choose discussion type.";
    }
  }
  if (!form.formAcknowledgementAccepted) {
    errors.formAcknowledgementAccepted = "Please confirm the acknowledgement before submitting.";
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
  enquiryType: "general_information",
  mainNeed: "General Enquiry",
  preferredDate: "",
  preferredTime: "",
  consultationDurationMins: "30",
  bookingType: "video",
  consultationOffer: "first_15_free",
  timeZone: "Australia/Brisbane",
  message: "",
  privacyPolicyAccepted: false,
  formAcknowledgementAccepted: false,
  hCaptchaToken: "",
  referralSource: "",
  referralCode: "",
  utmSource: "",
};

function processingSummaryNote(processing) {
  // Integration telemetry is no longer returned on public contact responses.
  void processing;
  return "";
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
  if (errorCode === "MAIL_DELIVERY_FAILED") {
    return "We could not send your enquiry by email right now. Please try again in a few minutes, or contact us by phone or email.";
  }
  return fallbackMessage || "Could not submit enquiry.";
}

export function ContactLeadForm({
  className = "",
  mode = "general",
  /** Minimum hours before consultation start (from server env; default 24). */
  consultationMinAdvanceHours = 24,
  acknowledgementText = "",
  defaultEnquiryType = "general_information",
  lockEnquiryType = false,
}) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    enquiryType:
      defaultEnquiryType === "education_enquiry" ? "education_enquiry" : "general_information",
    mainNeed: mainNeedFromEnquiryType(
      defaultEnquiryType === "education_enquiry" ? "education_enquiry" : "general_information"
    ),
  }));
  const acknowledgementLabel =
    String(acknowledgementText || "").trim() || DEFAULT_COMPLIANCE.formAcknowledgementText;
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
          ["preferredCountry", "enquiryType", "preferredDate", "preferredTime", "timeZone"],
          ["bookingType", "consultationOffer"],
          ["message", "formAcknowledgementAccepted", "privacyPolicyAccepted"],
        ]
      : [
          ["firstName", "lastName", "email", "phone"],
          ["preferredCountry", "enquiryType"],
          ["message", "formAcknowledgementAccepted", "privacyPolicyAccepted"],
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
      enquiryType: pathwayGoal.toLowerCase().includes("student") || pathwayGoal.toLowerCase().includes("study")
        ? "education_enquiry"
        : current.enquiryType,
      mainNeed: pathwayGoal.toLowerCase().includes("student") || pathwayGoal.toLowerCase().includes("study")
        ? "Student Pathway"
        : current.mainNeed,
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
    const nextVal = type === "checkbox" ? checked : value;
    setForm((current) => {
      const next = {
        ...current,
        [name]: nextVal,
      };
      if (name === "enquiryType") {
        next.mainNeed = mainNeedFromEnquiryType(String(nextVal || ""));
      }
      return next;
    });
    setFieldErrors((current) => {
      const next = { ...current };
      if (name === "email") {
        const em = String(type === "checkbox" ? "" : value).trim();
        if (em && !isValidEmailClient(em)) {
          next.email = "Please enter a valid email address.";
        } else {
          delete next.email;
        }
        return next;
      }
      if (!current[name]) return current;
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
      let response;
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          enquiryType: String(form.enquiryType || "general_information").trim(),
          mainNeed: mainNeedFromEnquiryType(String(form.enquiryType || "general_information")),
          consultationDurationMins: "30",
          privacyPolicyAccepted: Boolean(form.privacyPolicyAccepted),
          formAcknowledgementAccepted: Boolean(form.formAcknowledgementAccepted),
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
      if (data.outcome === "referred_to_authorised_professional") {
        setState({
          status: "success",
          message:
            data.restrictedEnquiryMessage ||
            data.warning ||
            DEFAULT_COMPLIANCE.restrictedEnquiryMessage,
        });
        setForm((current) => ({
          ...initialForm,
          enquiryType: current.enquiryType,
          mainNeed: mainNeedFromEnquiryType(current.enquiryType),
        }));
        setFieldErrors({});
        return;
      }
      const syncNote = processingSummaryNote(data.processing);
      setState({
        status: "success",
        message: data.consultationBooked
          ? `Discussion booked successfully.${data.meetUrl ? ` Meet link: ${data.meetUrl}` : ""}${data.checkoutUrl ? ` Secure payment: ${data.checkoutUrl}` : ""}${syncNote}`
          : (data.warning || "Your enquiry has been received. We will review it and respond shortly.") + syncNote,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("minrosh:enquiry-created"));
      }
      trackEvent("contact_form_submitted", {
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
        <p className="text-sm text-brand-plum/60 font-medium mb-4">General information or education-course enquiries only. We usually reply within 1 business day.</p>
        
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

      {mode === "consultation" ? (
        <div className="mb-6 rounded-2xl border border-brand-plum/10 bg-brand-cream/50 p-4 text-sm text-brand-plum/80">
          <p className="font-semibold text-brand-plum">What this discussion covers</p>
          <p className="mt-1 leading-relaxed">
            Book a general information discussion or education-course conversation. We do not assess visa eligibility,
            recommend a visa, or prepare or lodge applications. For personalised immigration assistance, use a registered
            migration agent or Australian legal practitioner.
          </p>
        </div>
      ) : null}
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
        {floatingField(
          "Last name",
          "lastName",
          <input
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
            className="pt-7"
          />,
          "",
          "err-lastName"
        )}
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
        {floatingField(
          "Phone",
          "phone",
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            className="pt-7"
            aria-invalid={fieldErrors.phone ? "true" : undefined}
            aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
          />,
          fieldErrors.phone,
          "err-phone"
        )}
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
        <label
          className={fieldErrors.enquiryType ? "has-error" : ""}
          hidden={mobileStepper && !visibleFields?.has("enquiryType")}
        >
          <span>Enquiry type</span>
          <select
            name="enquiryType"
            value={form.enquiryType}
            onChange={handleChange}
            disabled={lockEnquiryType}
            aria-invalid={fieldErrors.enquiryType ? "true" : undefined}
            aria-describedby={fieldErrors.enquiryType ? "err-enquiryType" : undefined}
          >
            <option value="general_information">General information / official source link</option>
            <option value="education_enquiry">Education course or admissions enquiry</option>
          </select>
          {fieldErrors.enquiryType ? (
            <span className="field-error" id="err-enquiryType" role="alert">
              {fieldErrors.enquiryType}
            </span>
          ) : null}
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
              <span>Preferred time (30-minute slots)</span>
              <input
                type="time"
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                step={1800}
                required
                aria-invalid={fieldErrors.preferredTime ? "true" : undefined}
                aria-describedby={
                  fieldErrors.preferredTime
                    ? "err-preferredTime"
                    : "hint-consultation-hours"
                }
              />
              <span id="hint-consultation-hours" className="text-xs text-brand-plum/60 mt-1 block leading-relaxed">
                Date and time are in your selected time zone; bookings need at least{" "}
                {consultationMinAdvanceHours} hours&apos; notice. Available windows are enforced in{" "}
                <strong className="font-semibold text-brand-plum/80">Brisbane (AEST)</strong>:
                Monday–Friday 7:00 pm–10:00 pm; Saturday–Sunday 9:00 am–10:00 pm (last start 9:30 pm Brisbane).
              </span>
              {fieldErrors.preferredTime ? (
                <span className="field-error" id="err-preferredTime" role="alert">
                  {fieldErrors.preferredTime}
                </span>
              ) : null}
            </label>
            <label hidden={mobileStepper && !visibleFields?.has("timeZone")}>
              <span>Time zone</span>
              <select name="timeZone" value={form.timeZone} onChange={handleChange}>
                <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                <option value="Asia/Colombo">Asia/Colombo (Sri Lanka)</option>
                <option value="Australia/Brisbane">Australia/Brisbane</option>
              </select>
              <span className="text-xs text-brand-plum/60 mt-1 block">
                Discussion length is fixed at 30 minutes (matches calendar and payment). Windows above refer to
                Brisbane local time even when another zone is selected for display.
              </span>
            </label>
            <label className={fieldErrors.bookingType ? "has-error" : ""} hidden={mobileStepper && !visibleFields?.has("bookingType")}>
              <span>Discussion type</span>
              <select
                name="bookingType"
                value={form.bookingType}
                onChange={handleChange}
                aria-invalid={fieldErrors.bookingType ? "true" : undefined}
                aria-describedby={fieldErrors.bookingType ? "err-bookingType" : undefined}
              >
                <option value="video">Video discussion (Google Meet)</option>
                <option value="phone">Phone discussion</option>
                <option value="in_person">In-person discussion</option>
              </select>
              {fieldErrors.bookingType ? (
                <span className="field-error" id="err-bookingType" role="alert">
                  {fieldErrors.bookingType}
                </span>
              ) : null}
            </label>
            <label hidden={mobileStepper && !visibleFields?.has("consultationOffer")}>
              <span>Discussion offer</span>
              <select name="consultationOffer" value={form.consultationOffer} onChange={handleChange}>
                <option value="first_15_free">First 15 minutes free</option>
                <option value="standard">Standard discussion</option>
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
              maxLength={MAX_CONTACT_MESSAGE_CHARS}
              placeholder="Ask a general information question or describe your education-course / admissions enquiry. Please do not send passport or visa documents."
              required
              aria-invalid={fieldErrors.message ? "true" : undefined}
              aria-describedby={fieldErrors.message ? "err-message msg-char-count" : "msg-char-count"}
            />
          </label>
          <p id="msg-char-count" className="mb-1 text-right text-xs font-semibold text-brand-plum/55" aria-live="polite">
            {String(form.message || "").length} / {MAX_CONTACT_MESSAGE_CHARS}
          </p>
          {quizSummaryLine ? (
            <div className="mb-4 p-3 rounded-lg bg-brand-rose/5 border border-brand-rose/10 text-[10px] sm:text-xs font-medium text-brand-rose">
              <p>
                A session note from this browser may be included with your enquiry. Add any extra general or education
                detail in your message.
              </p>
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
          className={`flex items-start gap-3 text-sm p-4 rounded-xl border border-brand-plum/5 bg-brand-plum/[0.02] cursor-pointer hover:bg-brand-plum/[0.04] transition-colors${fieldErrors.formAcknowledgementAccepted ? " has-error border-[color:var(--brand-rose)]/35 bg-[color:var(--brand-rose)]/[0.06]" : ""}`}
          hidden={mobileStepper && !visibleFields?.has("formAcknowledgementAccepted")}
        >
          <input
            type="checkbox"
            name="formAcknowledgementAccepted"
            checked={Boolean(form.formAcknowledgementAccepted)}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-brand-plum/20 text-brand-rose focus:ring-brand-rose"
            aria-invalid={fieldErrors.formAcknowledgementAccepted ? "true" : undefined}
            aria-describedby={fieldErrors.formAcknowledgementAccepted ? "err-formAcknowledgementAccepted" : undefined}
            required
          />
          <span className="text-xs font-medium text-brand-plum/70 leading-relaxed">{acknowledgementLabel}</span>
        </label>
        {fieldErrors.formAcknowledgementAccepted ? (
          <p className="field-error -mt-4 px-4" id="err-formAcknowledgementAccepted" role="alert">
            {fieldErrors.formAcknowledgementAccepted}
          </p>
        ) : null}

        <label
          className={`flex items-start gap-3 text-sm p-4 rounded-xl border border-brand-plum/5 bg-brand-plum/[0.02] cursor-pointer hover:bg-brand-plum/[0.04] transition-colors${fieldErrors.privacyPolicyAccepted ? " has-error border-[color:var(--brand-rose)]/35 bg-[color:var(--brand-rose)]/[0.06]" : ""}`}
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
            <Link href="/privacy-policy" className="text-brand-rose underline font-bold" onClick={(e) => e.stopPropagation()}>
              Privacy Policy
            </Link>{" "}
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
          className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} w-full py-5 text-lg font-black opacity-100 disabled:pointer-events-none disabled:opacity-60`}
          disabled={state.status === "loading"}
        >
          {state.status === "loading"
            ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
                Sending your enquiry...
              </>
            )
            : mobileStepper && currentStep < stepFieldGroups.length - 1
              ? "Continue to next step"
              : mode === "consultation" ? "Confirm discussion booking" : "Send enquiry"}
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
              className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} py-3 px-6 text-sm disabled:pointer-events-none disabled:opacity-60`}
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
