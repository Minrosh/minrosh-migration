"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "@/lib/whatsapp-prefill";

/** Inline **bold** segments (Gemini/OpenAI often emit this). */
function formatBoldSegments(text) {
  if (text == null || text === "") return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.length >= 4 && part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * Turn model plain text into paragraphs, ordered lists, and bullet lists so replies are not one wall of text.
 */
function parseAssistantChunks(text) {
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  /** @type {{ type: "p" | "ol" | "ul"; text?: string; items?: string[] }[]} */
  const chunks = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    if (/^\s*$/.test(raw)) {
      i += 1;
      continue;
    }
    if (/^\s*\d+\./.test(raw)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\./.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s*/, "").trim());
        i += 1;
      }
      chunks.push({ type: "ol", items });
      continue;
    }
    if (/^\s*[*•\-]\s/.test(raw)) {
      const items = [];
      while (i < lines.length && /^\s*[*•\-]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[*•\-]\s+/, "").trim());
        i += 1;
      }
      chunks.push({ type: "ul", items });
      continue;
    }
    const buf = [];
    while (i < lines.length) {
      const L = lines[i];
      if (/^\s*$/.test(L)) {
        i += 1;
        break;
      }
      if (/^\s*\d+\./.test(L) || /^\s*[*•\-]\s/.test(L)) break;
      buf.push(L);
      i += 1;
    }
    const t = buf.join("\n").trim();
    if (t) chunks.push({ type: "p", text: t });
  }
  return chunks;
}

function AssistantMessageBody({ text }) {
  const chunks = parseAssistantChunks(text);
  if (chunks.length === 0) {
    const t = String(text).trim();
    if (!t) return null;
    return (
      <div className="ai-concierge__assistant-body">
        <p className="ai-concierge__para">{formatBoldSegments(t)}</p>
      </div>
    );
  }
  return (
    <div className="ai-concierge__assistant-body">
      {chunks.map((chunk, idx) => {
        if (chunk.type === "ol") {
          return (
            <ol key={idx} className="ai-concierge__list ai-concierge__list--ordered">
              {chunk.items.map((item, j) => (
                <li key={j}>{formatBoldSegments(item)}</li>
              ))}
            </ol>
          );
        }
        if (chunk.type === "ul") {
          return (
            <ul key={idx} className="ai-concierge__list">
              {chunk.items.map((item, j) => (
                <li key={j}>{formatBoldSegments(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="ai-concierge__para">
            {formatBoldSegments(chunk.text)}
          </p>
        );
      })}
    </div>
  );
}

let messageCounter = 0;

function nextMessageId() {
  messageCounter += 1;
  return `m-${messageCounter}`;
}

/** Shown before any user message; after chat starts, prompts update from last user text. */
const initialSuggestedPrompts = [
  "Skilled migration options",
  "Student visa planning",
  "Partner visa first steps",
  "Fastest next step (urgent)",
];

const contextualPrompts = {
  partner: [
    "What evidence should we gather first?",
    "Partner visa page",
    "Book a consultation",
    "Compare partner vs prospective marriage",
  ],
  student: [
    "Student visa requirements",
    "Education consultation",
    "Course selection and visa timing",
    "Post-study pathways",
  ],
  skilled: [
    "Skilled migration overview",
    "Points and skills assessment",
    "State nomination vs independent",
    "Book strategy discussion",
  ],
  visitor: ["Visitor visa purpose and ties", "Contact MinRosh", "Book consultation", "Australia hub"],
  destinations: ["Australia hub", "New Zealand hub", "Canada hub", "United Kingdom hub"],
  sriLanka: ["Sri Lanka → Australia hub", "Skilled migration", "Free assessment", "Book consultation"],
  default: [
    "Skilled migration options",
    "Student visa planning",
    "Partner visa first steps",
    "Book consultation",
  ],
};

function suggestedPromptsFromMessages(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content) return initialSuggestedPrompts;
  const t = lastUser.content;
  if (/partner|spouse|relationship|family/i.test(t)) return contextualPrompts.partner;
  if (/student|study|university|college|education|course/i.test(t)) return contextualPrompts.student;
  if (/skilled|points|eoi|occupation|189|190|491|nomination/i.test(t)) return contextualPrompts.skilled;
  if (/visitor|tourist|holiday/i.test(t)) return contextualPrompts.visitor;
  if (/australia|new zealand|canada|uk|united kingdom|destination/i.test(t)) return contextualPrompts.destinations;
  if (/sri lanka|colombo|lankan/i.test(t)) return contextualPrompts.sriLanka;
  return contextualPrompts.default;
}

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
        "We could not read the assistant’s reply (temporary network or format issue). Please try again, or use WhatsApp or Book above.",
    };
  }

  if (data && data.ok === false && data.error) {
    const err = data.error;
    const code = typeof err === "object" ? err.code : undefined;
    const msg =
      typeof err === "string"
        ? err
        : err?.message || "The assistant is temporarily unavailable. Please try again shortly.";
    return { ok: false, kind: "api", code, message: msg };
  }

  const envelopeData = data?.data && typeof data.data === "object" ? data.data : data;
  const reply = envelopeData?.choices?.[0]?.message?.content?.trim();
  if (reply) return { ok: true, reply };

  const err = data?.error;
  const code = data?.error?.code || data?.code;
  const serverMsg =
    typeof err === "string"
      ? err
      : err?.message || envelopeData?.error || data?.message || `Request failed (${response.status})`;
  return { ok: false, kind: "api", code, message: serverMsg };
}

export function AIConcierge({ siteData }) {
  const waFloat = buildWhatsAppUrl(
    siteData?.brand?.whatsapp,
    "Hi MinRosh Migration, I just completed your points test and would like to discuss my Australian visa options."
  );
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask about skilled migration, student or partner visas, or education planning. I give practical next steps—not legal advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ text: "", tone: "info" });
  const logRef = useRef(null);
  const suggestionsRef = useRef(null);

  const scrollLogToEnd = useCallback(() => {
    const el = logRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollLogToEnd();
  }, [messages, loading, open, scrollLogToEnd]);

  /** Lets CSS hide bottom fixed CTAs and tighten panel height so messages are not covered. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const cls = "ai-concierge-panel-open";
    if (open) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => {
      document.body.classList.remove(cls);
    };
  }, [open]);

  function setSoftNotice(text, tone = "info") {
    setNotice(text ? { text, tone } : { text: "", tone: "info" });
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (suggestionsRef.current) {
      suggestionsRef.current.open = false;
    }

    const userMsg = { id: nextMessageId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setSoftNotice("");

    try {
      const apiMessages = nextMessages.map(({ role, content }) => ({ role, content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const rawText = await response.text();
      const parsed = parseChatResponse(rawText, response);

      if (parsed.ok) {
        setMessages((current) => [
          ...current,
          { id: nextMessageId(), role: "assistant", content: parsed.reply },
        ]);
        return;
      }

      if (parsed.kind === "api" && parsed.code === "AI_PROVIDER_NOT_CONFIGURED") {
        setMessages((current) => [
          ...current,
          {
            id: nextMessageId(),
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
        {
          id: nextMessageId(),
          role: "assistant",
          content: fallback.content,
          actions: fallback.actions,
        },
      ]);
      setSoftNotice(
        parsed.kind === "parse"
          ? parsed.message
          : parsed.message && parsed.kind === "api"
            ? parsed.message
            : "Live assistant was unavailable just now — below is general guidance from our site, not an AI reply. Try again or use Book / WhatsApp.",
        "soft"
      );
    } catch (err) {
      const fallback = getFallbackReply(trimmed);
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          role: "assistant",
          content: fallback.content,
          actions: fallback.actions,
        },
      ]);
      setSoftNotice(err?.message || "Something went wrong. Try again or use the WhatsApp button.", "soft");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  const dynamicPrompts = suggestedPromptsFromMessages(messages);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/upload")) {
    return null;
  }

  return (
    <div className={`floating-tools ${open ? "is-open" : ""}`} aria-label="Quick contact tools">
      {open ? (
        <div className="ai-concierge">
          <div className="ai-concierge__head">
            <div>
              <strong>Ask MinRosh</strong>
              <span>General information — not formal migration advice</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Ask MinRosh">
              ×
            </button>
          </div>

          <div className="ai-concierge__cta-row" aria-label="Quick actions">
            <Link href="/book-consultation" className="ai-concierge__cta-chip">
              Book
            </Link>
            <Link href="/contact" className="ai-concierge__cta-chip">
              Contact
            </Link>
            <a className="ai-concierge__cta-chip" href={waFloat} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>

          <details className="ai-concierge__legal">
            <summary>About this assistant</summary>
            <p className="ai-concierge__legal-text">
              Replies are orientation only. Visa decisions need current official rules and often a
              registered migration agent.
            </p>
          </details>

          <details ref={suggestionsRef} className="ai-concierge__suggestions">
            <summary>Suggested questions</summary>
            <div className="ai-concierge__suggestions-inner">
              {dynamicPrompts.map((prompt, idx) => (
                <button key={`${idx}-${prompt}`} type="button" onClick={() => sendMessage(prompt)} disabled={loading}>
                  {prompt}
                </button>
              ))}
            </div>
          </details>

          <div ref={logRef} className="ai-concierge__messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-concierge__message ai-concierge__message--${message.role}`}
              >
                <div
                  className={`ai-concierge__bubble${message.role === "assistant" ? " ai-concierge__bubble--assistant" : ""}`}
                >
                  {message.role === "assistant" ? (
                    <AssistantMessageBody text={message.content} />
                  ) : (
                    <p>{message.content}</p>
                  )}
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
            {loading ? (
              <div className="ai-concierge__message ai-concierge__message--assistant" aria-busy="true">
                <div className="ai-concierge__bubble ai-concierge__bubble--assistant ai-concierge__bubble--typing">
                  <p>Thinking…</p>
                </div>
              </div>
            ) : null}
          </div>

          <form className="ai-concierge__form" onSubmit={handleSubmit}>
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your question…"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending…" : "Send"}
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

          <div className="ai-concierge__footer" aria-label="Quick links">
            <Link href="/assessment" className="ai-concierge__footer-btn">
              Assessment
            </Link>
            <Link href="/book-consultation" className="ai-concierge__footer-btn">
              Book
            </Link>
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
          Ask MinRosh
        </button>
      </div>
    </div>
  );
}
