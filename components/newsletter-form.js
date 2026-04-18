"use client";

import { useRef, useState } from "react";

export function NewsletterForm({ onSubscribed }) {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const hpRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
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
      const payload = await response.json();
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || data?.error;
      if (!response.ok || !(payload?.ok ?? data?.ok)) {
        throw new Error(errorMessage || "Could not subscribe right now.");
      }

      if (!data.exists) {
        onSubscribed?.();
      }

      setStatus({ type: "success", message: data.message });
      setEmail("");
      setMarketingConsent(false);
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
            id="footer-newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            required
            autoComplete="email"
          />
        </div>

        <label className="site-footer__newsletter-consent" htmlFor="footer-newsletter-consent">
          <input
            id="footer-newsletter-consent"
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            required
          />
          <span>
            I agree to receive marketing emails about visas and migration updates. I can unsubscribe at any time (see
            our privacy policy).
          </span>
        </label>

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
        <p className={`form-feedback is-${status.type === "success" ? "success" : "error"}`}>
          {status.message}
        </p>
      ) : null}
    </>
  );
}
