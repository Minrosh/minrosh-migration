"use client";

import { useState } from "react";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredCountry: "Australia",
  mainNeed: "Skilled Migration",
  message: "",
};

export function ContactLeadForm({ className = "" }) {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState({ status: "idle", message: "" });

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
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not submit enquiry.");
      }
      setState({
        status: "success",
        message:
          data.warning ||
          "Your enquiry has been received. We will review it and respond shortly.",
      });
      setForm(initialForm);
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
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
        </label>
        <label>
          <span>Last name</span>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          <span>Phone</span>
          <input name="phone" value={form.phone} onChange={handleChange} />
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
            <option>Employer-Sponsored</option>
            <option>Family / Complex Case</option>
          </select>
        </label>
        <label className="contact-grid__full">
          <span>Your enquiry</span>
          <textarea
            name="message"
            rows="6"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your situation, timeline, and the visa pathway you want to explore."
            required
          />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={state.status === "loading"}>
        {state.status === "loading" ? "Sending..." : "Submit enquiry"}
      </button>
      {state.message ? <p className={`form-feedback is-${state.status}`}>{state.message}</p> : null}
    </form>
  );
}
