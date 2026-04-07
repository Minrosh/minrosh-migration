"use client";

import { useRef, useState } from "react";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredCountry: "Australia",
  mainNeed: "General Enquiry",
  message: "",
};

export function QuickEnquiryForm({ className = "" }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ status: "idle", message: "" });
  const hpRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((c) => ({ ...c, [name]: value }));
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
          quickEnquiry: true,
          company: hpRef.current?.value || "",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not submit enquiry.");
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
    } catch (error) {
      setState({
        status: "error",
        message: error.message || "Could not submit enquiry.",
      });
    }
  }

  return (
    <form className={`contact-form bento-hover quick-enquiry-form ${className}`.trim()} onSubmit={handleSubmit}>
      <p className="section-label">Quick enquiry</p>
      <p className="quick-enquiry-form__hint">
        No email required — share your phone and a short message. Add email if you want a brochure copy.
      </p>
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
          <span>Phone (required)</span>
          <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} required />
        </label>
        <label>
          <span>Email (optional)</span>
          <input type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} />
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
            <option>General Enquiry</option>
            <option>Skilled Migration</option>
            <option>Student Visa</option>
            <option>Partner Visa</option>
            <option>Employer-Sponsored</option>
            <option>Student Pathway</option>
            <option>Family / Complex Case</option>
          </select>
        </label>
        <label className="contact-grid__full">
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
        {state.status === "loading" ? "Sending..." : "Send quick enquiry"}
      </button>
      {state.message ? (
        <p className={`form-feedback is-${state.status}`} role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
