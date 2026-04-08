"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  clearNavigatorSummarySession,
  quizSummaryFromNavigatorDetail,
  readNavigatorQuizSummaryLine,
} from "@/lib/navigator-session";

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
};

export function ContactLeadForm({ className = "", mode = "general" }) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [quizSummaryLine, setQuizSummaryLine] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const hpRef = useRef(null);

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
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ status: "loading", message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          company: hpRef.current?.value || "",
          quizSummary: quizSummaryLine,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not submit enquiry.");
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
      setForm(initialForm);
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
    <form className={`contact-form bento-hover ${className}`.trim()} onSubmit={handleSubmit}>
      <div className="contact-grid">
        <label>
          <span>First name</span>
          <input
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Last name</span>
          <input
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Preferred country</span>
          <select name="preferredCountry" value={form.preferredCountry} onChange={handleChange}>
            <option>Australia</option>
            <option>New Zealand</option>
            <option>Canada</option>
            <option>United Kingdom</option>
          </select>
        </label>
        <label>
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
            <label>
              <span>Preferred date</span>
              <input
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Preferred time</span>
              <input
                type="time"
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                required
              />
            </label>
            <label>
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
            <label>
              <span>Time zone</span>
              <select name="timeZone" value={form.timeZone} onChange={handleChange}>
                <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                <option value="Asia/Colombo">Asia/Colombo (Sri Lanka)</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </label>
          </>
        ) : null}
        <label className="contact-grid__full">
          <span>Your enquiry</span>
          <textarea
            name="message"
            rows="6"
            autoComplete="off"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your situation, timeline, and the visa pathway you want to explore."
            required
          />
        </label>
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
      <button type="submit" className="btn btn-primary" disabled={state.status === "loading"}>
        {state.status === "loading" ? "Sending..." : "Submit enquiry"}
      </button>
      {state.message ? (
        <p className={`form-feedback is-${state.status}`} role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
