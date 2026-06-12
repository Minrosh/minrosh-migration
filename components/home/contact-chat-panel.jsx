"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AgentRegistrationStrip } from "@/components/agent-registration-strip";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "@/lib/whatsapp-prefill";
import {
  clearNavigatorSummarySession,
  persistNavigatorSummary,
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
  message: "",
  privacyPolicyAccepted: false,
};

export function ContactChatPanel({ siteData, isActive }) {
  const waPrimary = buildWhatsAppUrl(siteData?.brand?.whatsapp, WHATSAPP_LEAD_MESSAGE);
  const waSecondary = buildWhatsAppUrl(siteData?.brand?.whatsappSecondary, WHATSAPP_LEAD_MESSAGE);
  const supportEmailLabel = String(siteData?.brand?.email || "").trim();

  const [contactForm, setContactForm] = useState(initialForm);
  const [contactState, setContactState] = useState({ status: "idle", message: "" });
  const [quizSummaryLine, setQuizSummaryLine] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask a preliminary question about Australian migration pathways and I'll help you think through the next step.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatState, setChatState] = useState({ loading: false, error: "" });
  const contactHpRef = useRef(null);

  useEffect(() => {
    setQuizSummaryLine(readNavigatorQuizSummaryLine());
  }, []);

  useEffect(() => {
    function handleNavigatorSummary(event) {
      const detail = event.detail;
      if (!detail?.summary && !detail?.quizSummaryShort) return;

      persistNavigatorSummary(detail);
      const line = quizSummaryFromNavigatorDetail(detail);
      if (line) {
        setQuizSummaryLine(line);
      }

      if (detail.summary) {
        setContactForm((current) => {
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
    return () => window.removeEventListener("minrosh:navigator-summary", handleNavigatorSummary);
  }, []);

  function handleContactChange(event) {
    const { name, value, type, checked } = event.target;
    setContactForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleContactSubmit(event) {
    event.preventDefault();
    if (!contactForm.privacyPolicyAccepted) {
      setContactState({
        status: "error",
        message: "Please confirm you have read the Privacy Policy before submitting.",
      });
      return;
    }
    setContactState({ status: "loading", message: "" });
    const payload = {
      ...contactForm,
      privacyPolicyAccepted: true,
      company: contactHpRef.current?.value || "",
      quizSummary: quizSummaryLine,
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const rawText = await response.text();
      let payload;
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch {
        setContactState({
          status: "error",
          message:
            response.status >= 500
              ? "The server returned an unexpected reply. Please try again shortly."
              : "We could not read the server response. Please refresh and try again.",
        });
        return;
      }
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const err = payload?.error;
      const errorCode =
        typeof err === "object" && err != null && typeof err.code === "string" ? err.code : "";
      const errorMessage =
        (typeof err === "object" && err != null && typeof err.message === "string" ? err.message : null) ||
        (typeof err === "string" ? err : null) ||
        (typeof data?.error === "string" ? data.error : null);
      if (!response.ok || !(payload?.ok ?? data?.ok)) {
        const friendly =
          errorCode === "MAIL_DELIVERY_FAILED"
            ? "We could not send your enquiry by email right now. Please try again in a few minutes, or contact us by phone or email."
            : errorMessage || "Could not submit enquiry.";
        throw new Error(friendly);
      }
      setContactState({
        status: "success",
        message:
          data.warning ||
          "Your enquiry has been received. We will review it and respond shortly.",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("minrosh:enquiry-created"));
      }
      setContactForm(initialForm);
      setQuizSummaryLine("");
      clearNavigatorSummarySession();
    } catch (error) {
      setContactState({
        status: "error",
        message: error.message || "Could not submit enquiry.",
      });
    }
  }

  async function handleChatSubmit(event) {
    event.preventDefault();
    if (!chatInput.trim()) return;
    const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatState({ loading: true, error: "" });
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error("Assistant returned an unexpected response.");
      }
      const envelopeData = data?.data && typeof data.data === "object" ? data.data : data;
      const reply = envelopeData?.choices?.[0]?.message?.content;
      const errorMessage = data?.error?.message || data?.error || envelopeData?.error;
      if (!response.ok || !reply) {
        const errMsg =
          response.status === 503 && data?.error?.code === "AI_PROVIDER_NOT_CONFIGURED"
            ? errorMessage ||
              "Live assistant is not configured on this server yet. Use WhatsApp or the enquiry form for a human reply."
            : errorMessage || "Chat is not available right now.";
        throw new Error(errMsg);
      }
      setChatMessages((current) => [...current, { role: "assistant", content: reply }]);
      setChatState({ loading: false, error: "" });
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I can't reach the live assistant from here. For a tailored reply, message MinRosh on WhatsApp or submit the contact form with your occupation, English level, and timeline.",
        },
      ]);
      setChatState({ loading: false, error: error.message || "Chat is unavailable right now." });
    }
  }

  return (
    <section id="contact" className={`tab-panel ${isActive ? "is-active" : ""}`}>
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="section-label">Contact</p>
          <h2>Start with a clear enquiry and we&apos;ll help shape the next steps.</h2>
          <p>
            Share your background, timing, and main goal. We&apos;ll review the enquiry and respond
            with the most relevant next move.
          </p>
          <div className="contact-details">
            <div>
              <span>Email</span>
              <Link href="/contact">{supportEmailLabel || "Email support via contact page"}</Link>
            </div>
            <div>
              <span>Phone</span>
              <a href={`tel:${siteData.brand.phone.replace(/\s+/g, "")}`}>{siteData.brand.phone}</a>
            </div>
            <div>
              <span>Alternate phone</span>
              <a href={`tel:${siteData.brand.phoneSecondary.replace(/\s+/g, "")}`}>
                {siteData.brand.phoneSecondary}
              </a>
            </div>
            <div>
              <span>WhatsApp</span>
              <a href={waPrimary} target="_blank" rel="noreferrer">
                {siteData.brand.phone}
              </a>
            </div>
            <div>
              <span>WhatsApp alternate</span>
              <a href={waSecondary} target="_blank" rel="noreferrer">
                {siteData.brand.phoneSecondary}
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-column">
          <AgentRegistrationStrip brand={siteData?.brand} />
          <form className="contact-form bento-hover" onSubmit={handleContactSubmit}>
          <div className="contact-grid">
            <label>
              <span>First name</span>
              <input
                name="firstName"
                autoComplete="given-name"
                value={contactForm.firstName}
                onChange={handleContactChange}
                required
              />
            </label>
            <label>
              <span>Last name</span>
              <input
                name="lastName"
                autoComplete="family-name"
                value={contactForm.lastName}
                onChange={handleContactChange}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={contactForm.email}
                onChange={handleContactChange}
                required
              />
            </label>
            <label>
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={contactForm.phone}
                onChange={handleContactChange}
              />
            </label>
            <label>
              <span>Preferred country</span>
              <select name="preferredCountry" value={contactForm.preferredCountry} onChange={handleContactChange}>
                <option>Australia</option>
                <option>New Zealand</option>
                <option>Canada</option>
                <option>United Kingdom</option>
              </select>
            </label>
            <label>
              <span>Main need</span>
              <select name="mainNeed" value={contactForm.mainNeed} onChange={handleContactChange}>
                <option>Skilled Migration</option>
                <option>Employer-Sponsored</option>
                <option>Student Pathway</option>
                <option>Student Visa</option>
                <option>Partner Visa</option>
                <option>Family / Complex Case</option>
                <option>General Enquiry</option>
              </select>
            </label>
            <label className="contact-grid__full">
              <span>Your enquiry</span>
              <textarea
                name="message"
                rows="6"
                autoComplete="off"
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
            </label>
          </div>
          <label className="contact-grid__full flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="privacyPolicyAccepted"
              checked={Boolean(contactForm.privacyPolicyAccepted)}
              onChange={handleContactChange}
              className="mt-1"
            />
            <span>
              I have read the{" "}
              <Link href="/privacy-policy" className="text-primary underline">
                Privacy Policy
              </Link>{" "}
              and agree you may use my details to respond.
            </span>
          </label>
          <input
            ref={contactHpRef}
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="sr-only"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
          />
          <button type="submit" className="btn btn-primary min-h-[48px]" disabled={contactState.status === "loading"}>
            {contactState.status === "loading" ? "Sending..." : "Submit enquiry"}
          </button>
          {contactState.message ? (
            <p
              className={`form-feedback is-${contactState.status}`}
              role="status"
              aria-live="polite"
            >
              {contactState.message}
            </p>
          ) : null}
        </form>
        </div>
      </div>

      <section className="assistant-panel">
        <div className="section-head">
          <div>
            <p className="section-label">AI Assistant</p>
            <h2>Ask a preliminary migration question</h2>
          </div>
        </div>
        <div className="assistant-chat bento-hover">
          <div className="assistant-chat__log" role="log" aria-live="polite" aria-relevant="additions">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`assistant-chat__message assistant-chat__message--${message.role}`}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <form className="assistant-chat__form" onSubmit={handleChatSubmit}>
            <textarea
              rows="3"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask about skilled migration, employer sponsorship, student pathways, or next steps."
            />
            <button type="submit" className="btn btn-primary min-h-[48px]" disabled={chatState.loading}>
              {chatState.loading ? "Thinking..." : "Send"}
            </button>
          </form>
          {chatState.error ? <p className="form-feedback is-error">{chatState.error}</p> : null}
          <p className="assistant-note">
            General information only. Always verify current requirements and seek formal advice for
            your situation.
          </p>
        </div>
      </section>
    </section>
  );
}
