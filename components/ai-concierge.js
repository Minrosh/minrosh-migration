"use client";

import { useState } from "react";

const quickPrompts = [
  "I want to understand skilled migration options.",
  "I need help with student visa planning.",
  "What is the best first step for a partner visa?",
];

export function AIConcierge({ siteData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I’m the MinRosh AI Concierge. Tell me whether you need help with skilled migration, student visas, partner pathways, education planning, or a general visa question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (!response.ok || !reply) {
        throw new Error(data.error || "AI Concierge is unavailable right now.");
      }
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message || "AI Concierge is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="floating-tools" aria-label="Quick contact tools">
      {open ? (
        <div className="ai-concierge">
          <div className="ai-concierge__head">
            <div>
              <strong>AI Concierge</strong>
              <span>Preliminary guidance before consultation</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close AI Concierge">
              ×
            </button>
          </div>
          <div className="ai-concierge__messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`ai-concierge__message ai-concierge__message--${message.role}`}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <div className="ai-concierge__prompts">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <form className="ai-concierge__form" onSubmit={handleSubmit}>
            <textarea
              rows="3"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about visa pathways, study planning, or next steps."
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
          {error ? <p className="form-feedback is-error">{error}</p> : null}
          <div className="ai-concierge__footer">
            <a
              href={`https://wa.me/${siteData.brand.whatsapp}?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20with%20visa%20options.`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp {siteData.brand.phone}
            </a>
            <a
              href={`https://wa.me/${siteData.brand.whatsappSecondary}?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20with%20visa%20options.`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp {siteData.brand.phoneSecondary}
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="floating-tools__ai"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open ? "true" : "false"}
      >
        AI Concierge
      </button>

      <a
        className="whatsapp-float"
        href={`https://wa.me/${siteData.brand.whatsapp}?text=Hi%20MinRosh%20Migration,%20I%20just%20completed%20your%20points%20test%20and%20would%20like%20to%20discuss%20my%20Australian%20visa%20options.`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with MinRosh Migration on WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path
            fill="currentColor"
            d="M27.3 4.7C24.3 1.7 20.3 0 16 0 7.2 0 0 7.2 0 16c0 2.8.7 5.5 2.1 7.9L0 32l8.3-2.2c2.3 1.2 4.9 1.9 7.7 1.9h.1c8.8 0 15.9-7.2 15.9-16 0-4.3-1.7-8.3-4.7-11zm-11.2 24c-2.4 0-4.7-.6-6.8-1.8l-.5-.3-4.9 1.3 1.3-4.8-.3-.5C3.7 20.6 3 18.3 3 16 3 8.8 8.8 3 16 3c3.5 0 6.8 1.4 9.2 3.8 2.5 2.5 3.8 5.7 3.8 9.2 0 7.2-5.8 13-12.9 13zm7.1-9.7c-.4-.2-2.3-1.1-2.7-1.2-.4-.2-.7-.2-.9.2-.3.4-1 1.2-1.2 1.4-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.2 0-.5 0-.7 0-.2-.9-2.1-1.3-2.9-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .4-.3.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.3 6.9 6 .9.4 1.6.6 2.2.8.9.3 1.8.3 2.5.2.8-.1 2.3-.9 2.7-1.7.3-.8.3-1.5.2-1.7-.1-.1-.4-.2-.8-.4z"
          />
        </svg>
      </a>
    </div>
  );
}
