"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearNavigatorSummarySession,
  quizSummaryFromNavigatorDetail,
  readNavigatorQuizSummaryLine,
} from "@/lib/navigator-session";

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

export function QuickEnquiryForm({ className = "" }) {
  const [form, setForm] = useState(initial);
  const [quizSummaryLine, setQuizSummaryLine] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const [mobileStepper, setMobileStepper] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const hpRef = useRef(null);

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
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (mobileStepper && currentStep < stepFieldGroups.length - 1) {
      setCurrentStep((prev) => Math.min(stepFieldGroups.length - 1, prev + 1));
      return;
    }
    if (!form.privacyPolicyAccepted) {
      setState({
        status: "error",
        message: "Please confirm you have read the Privacy Policy before submitting.",
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
      const payload = await response.json();
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || data?.error;
      if (!response.ok || !(payload?.ok ?? data?.ok)) {
        throw new Error(errorMessage || "Could not submit enquiry.");
      }
      setState({
        status: "success",
        message:
          data.warning ||
          "Thanks — we have your message and will follow up by phone or WhatsApp shortly.",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("minrosh:enquiry-created"));
      }
      setForm(initial);
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
      <div className="contact-grid">
        <label hidden={mobileStepper && !visibleFields?.has("firstName")}>
          <span>First name</span>
          <input
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
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
        <label hidden={mobileStepper && !visibleFields?.has("phone")}>
          <span>Phone (required)</span>
          <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} required />
        </label>
        <label hidden={mobileStepper && !visibleFields?.has("email")}>
          <span>Email (optional)</span>
          <input type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} />
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
        <label className="contact-grid__full" hidden={mobileStepper && !visibleFields?.has("message")}>
          <span>Your message</span>
          <textarea
            name="message"
            rows="4"
            autoComplete="off"
            value={form.message}
            onChange={handleChange}
            placeholder="e.g. occupation, years of experience, and whether you are in Sri Lanka or already offshore."
            required
          />
        </label>
      </div>
      <label
        className="contact-grid__full flex items-start gap-2 text-sm"
        hidden={mobileStepper && !visibleFields?.has("privacyPolicyAccepted")}
      >
        <input
          type="checkbox"
          name="privacyPolicyAccepted"
          checked={Boolean(form.privacyPolicyAccepted)}
          onChange={handleChange}
          className="mt-1"
        />
        <span>
          I have read the{" "}
          <a href="/privacy-policy" className="text-primary underline">
            Privacy Policy
          </a>{" "}
          and agree you may use my details to respond.
        </span>
      </label>
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
