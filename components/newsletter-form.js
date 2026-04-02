"use client";

import { useState } from "react";

export function NewsletterForm({ onSubscribed }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not subscribe right now.");
      }

      if (!data.exists) {
        onSubscribed?.();
      }

      setStatus({ type: "success", message: data.message });
      setEmail("");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not subscribe right now." });
    }
  }

  return (
    <>
      <form className="site-footer__newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={status.type === "loading"}>
          {status.type === "loading" ? "Joining..." : "Subscribe"}
        </button>
      </form>
      {status.message ? (
        <p className={`form-feedback is-${status.type === "success" ? "success" : "error"}`}>
          {status.message}
        </p>
      ) : null}
    </>
  );
}
