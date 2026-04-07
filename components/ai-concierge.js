"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "@/lib/whatsapp-prefill";

const quickPrompts = [
  "Skilled migration options",
  "Student visa planning",
  "Partner visa first steps",
  "Fastest next step (urgent)",
];

const fallbackReplies = [
  {
    match: /study|student|university|college|education/i,
    content:
      "For study goals, MinRosh can help with course planning, education consultation, and student visa preparation. Next step: education consultation or a direct enquiry if timing is tight.",
    actions: [
      { href: "/education-consultation", label: "Education consultation" },
      { href: "/student-visa-australia", label: "Student visas" },
    ],
  },
  {
    match: /skilled|work|job|occupation|eoi|points|sponsor/i,
    content:
      "For skilled migration, gather occupation, work history, qualifications, English level, and timing. We can help compare pathways such as 189, 190, or 491 in a strategy session.",
    actions: [
      { href: "/skilled-migration", label: "Skilled migration" },
      { href: "/assessment", label: "Free assessment" },
    ],
  },
  {
    match: /partner|family|spouse|parent|relationship/i,
    content:
      "Partner and family pathways depend heavily on evidence and relationship history. We can help you plan documents and next steps before you lodge.",
    actions: [
      { href: "/partner-visa-australia", label: "Partner visa" },
      { href: "/book-consultation", label: "Book consultation" },
    ],
  },
  {
    match: /visitor|tourist/i,
    content:
      "Visitor visas need a clear purpose, funds, and ties home. A short consultation usually helps avoid weak applications.",
    actions: [
      { href: "/contact", label: "Contact" },
      { href: "/book-consultation", label: "Book consultation" },
    ],
  },
  {
    match: /australia|new zealand|canada|uk|united kingdom/i,
    content:
      "MinRosh supports four destination systems. Open the hub that matches your goal, then book a consultation for tailored sequencing.",
    actions: [
      { href: "/destinations/australia", label: "Australia" },
      { href: "/destinations/new-zealand", label: "New Zealand" },
      { href: "/destinations/canada", label: "Canada" },
      { href: "/destinations/united-kingdom", label: "UK" },
    ],
  },
  {
    match: /sri lanka|colombo|lankan/i,
    content:
      "Many skilled clients start with occupation fit, skills assessment sequencing, and a realistic points view. See the Sri Lanka hub for context.",
    actions: [
      { href: "/migration-sri-lanka-to-australia", label: "Sri Lanka → Australia" },
      { href: "/skilled-migration", label: "Skilled migration" },
    ],
  },
];

function getFallbackReply(message) {
  const matched = fallbackReplies.find((item) => item.match.test(message));
  if (matched) return matched;
  return {
    content:
      "The next step is usually a free assessment or a consultation enquiry so we can review your situation properly.",
    actions: [
      { href: "/assessment", label: "Free assessment" },
      { href: "/book-consultation", label: "Book consultation" },
    ],
  };
}

function parseChatResponse(rawText, response) {
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    return {
      ok: false,
      kind: "parse",
      message:
        "The assistant returned an unreadable response. Check that GEMINI_API_KEY is set in .env, run npm run build, and pm2 restart — or try again shortly.",
    };
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (reply) return { ok: true, reply };

  const err = data?.error;
  const serverMsg =
    typeof err === "string" ? err : err?.message || data?.message || `Request failed (${response.status})`;
  return { ok: false, kind: "api", code: data?.code, message: serverMsg };
}

export function AIConcierge({ siteData }) {
  const waPrimary = buildWhatsAppUrl(siteData?.brand?.whatsapp, WHATSAPP_LEAD_MESSAGE);
  const waSecondary = buildWhatsAppUrl(siteData?.brand?.whatsappSecondary, WHATSAPP_LEAD_MESSAGE);
  const waFloat = buildWhatsAppUrl(
    siteData?.brand?.whatsapp,
    "Hi MinRosh Migration, I just completed your points test and would like to discuss my Australian visa options."
  );
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask about skilled migration, student or partner visas, or education planning. I give practical next steps—not legal advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ text: "", tone: "info" });

  function setSoftNotice(text, tone = "info") {
    setNotice(text ? { text, tone } : { text: "", tone: "info" });
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setSoftNotice("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const rawText = await response.text();
      const parsed = parseChatResponse(rawText, response);

      if (parsed.ok) {
        setMessages((current) => [...current, { role: "assistant", content: parsed.reply }]);
        return;
      }

      if (parsed.kind === "api" && parsed.code === "AI_PROVIDER_NOT_CONFIGURED") {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              parsed.message ||
              "Live AI is not configured on this server. Add GEMINI_API_KEY from Google AI Studio to .env, then rebuild and restart the app.",
          },
        ]);
        setSoftNotice("Tip: get a key at aistudio.google.com/apikey", "info");
        return;
      }

      const fallback = getFallbackReply(trimmed);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: fallback.content, actions: fallback.actions },
      ]);
      setSoftNotice(
        parsed.kind === "parse"
          ? parsed.message
          : "Live AI was unavailable, so this is fixed guidance on our site—not a model reply.",
        "soft"
      );
    } catch (err) {
      const fallback = getFallbackReply(trimmed);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: fallback.content, actions: fallback.actions },
      ]);
      setSoftNotice(err?.message || "Something went wrong. Try again or use WhatsApp below.", "soft");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/upload")) {
    return null;
  }

  return (
    <div className={`floating-tools ${open ? "is-open" : ""}`} aria-label="Quick contact tools">
      {open ? (
        <div className="ai-concierge">
          <div className="ai-concierge__head">
            <div>
              <strong>AI Concierge</strong>
              <span>Guidance only — not legal or migration advice</span>
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
                <div className="ai-concierge__bubble">
                  <p>{message.content}</p>
                  {message.actions?.length ? (
                    <div className="ai-concierge__actions">
                      {message.actions.map((action) => (
                        <Link key={`${action.href}-${action.label}`} href={action.href}>
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <details className="ai-concierge__suggestions">
            <summary>Suggested questions</summary>
            <div className="ai-concierge__suggestions-inner">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={loading}>
                  {prompt}
                </button>
              ))}
            </div>
          </details>

          <form className="ai-concierge__form" onSubmit={handleSubmit}>
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question…"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Thinking…" : "Send"}
            </button>
          </form>

          {notice.text ? (
            <p
              className={`ai-concierge__notice${notice.tone === "soft" ? " ai-concierge__notice--soft" : ""}`}
              role="status"
            >
              {notice.text}
            </p>
          ) : null}

          <div className="ai-concierge__footer" aria-label="Other ways to reach MinRosh">
            <Link href="/assessment">Assessment</Link>
            <span className="ai-concierge__footer-sep" aria-hidden="true">
              ·
            </span>
            <Link href="/book-consultation">Book</Link>
            <span className="ai-concierge__footer-sep" aria-hidden="true">
              ·
            </span>
            <a href={waPrimary} target="_blank" rel="noreferrer">
              WhatsApp {siteData.brand.phone}
            </a>
            <span className="ai-concierge__footer-sep" aria-hidden="true">
              ·
            </span>
            <a href={waSecondary} target="_blank" rel="noreferrer">
              Alt {siteData.brand.phoneSecondary}
            </a>
          </div>
        </div>
      ) : null}

      <div className="floating-tools__dock">
        <a
          className="whatsapp-float"
          href={waFloat}
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
        <button
          type="button"
          className="floating-tools__ai"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open ? "true" : "false"}
        >
          AI Concierge
        </button>
      </div>
    </div>
  );
}
