import { geminiChatCompletion } from "@/lib/chat/gemini";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import {
  CHAT_MAX_BODY_BYTES,
  CHAT_MAX_MESSAGE_CHARS,
  CHAT_MAX_MESSAGES,
  CHAT_MAX_TOTAL_CONTENT_CHARS,
  chatDailyQuotaAllow,
} from "@/lib/security/chat-limits";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

const systemPrompt = `You are the MinRosh Migration Assistant for minroshmigration.com.au.

Your job:
1. Read the user's latest message carefully and infer their goal (e.g. skilled migration, student visa, partner/family, employer-sponsored, visitor, or country comparison).
2. Reply in clear, plain English with short paragraphs or bullet points when helpful.
3. Give practical "next step" suggestions (documents to gather, questions to clarify, whether consultation may help).
4. Never present yourself as a lawyer or registered migration agent; do not claim you can guarantee an outcome.
5. When discussing Australian visas, remind the user that eligibility, charges, and rules must be verified on the Department of Home Affairs website.
6. For New Zealand, Canada, or the UK, point users to their official immigration sites rather than inventing detailed rules.
7. If the question is ambiguous, ask one or two focused clarifying questions at the end.
8. Format longer answers for readability: use **bold** only for short emphasis (not whole paragraphs). Put each numbered step on its own line starting with "1. ", "2. ", etc. Use a blank line between sections. Use lines starting with "* " for short bullet lists. Avoid dumping one huge paragraph.
9. Keep responses concise and decision-focused; avoid legal-style overexplaining.
10. Every reply must end with a clear next-step sentence that includes "Start Free Assessment" or "Book Consultation" (or both).
11. Use "general guidance only" framing for eligibility, timelines, or outcomes.
12. Do not request sensitive personal documents in chat. Suggest preparing them for assessment or consultation.

Official reference URLs (for suggestions only; do not quote long text from them):
- Australia visa listing: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing
- Canada visit/entry: https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html
- UK visas: https://www.gov.uk/browse/visas-immigration
- New Zealand find a visa: https://www.immigration.govt.nz/process-to-apply/find-a-visa-tool/

Internal site pages you may mention when relevant: /skilled-migration, /migration-sri-lanka-to-australia, /student-visa-australia, /partner-visa-australia, /book-consultation, /assessment, /destinations/australia, /destinations/new-zealand, /destinations/canada, /destinations/united-kingdom

Closing line style examples:
- "For general guidance based on your profile, Start Free Assessment; for case-specific planning, Book Consultation."
- "To move forward with clarity, Start Free Assessment first, then Book Consultation if your timeline is urgent."`;

const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
/** Stable ID for Google AI Studio generateContent — see https://ai.google.dev/gemini-api/docs/models/gemini */
const defaultGeminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const requestTimeoutMs = 20000;

const ALLOWED_MODELS = new Set([
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
]);

function pickModel(requested) {
  if (typeof requested === "string" && ALLOWED_MODELS.has(requested)) {
    return requested;
  }
  return defaultModel;
}

function normalizeMessages(raw) {
  if (!Array.isArray(raw)) return { ok: false, error: "Invalid messages." };
  const messages = raw
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim()
    )
    .slice(-CHAT_MAX_MESSAGES);

  let totalChars = 0;
  for (const m of messages) {
    if (m.content.length > CHAT_MAX_MESSAGE_CHARS) {
      return { ok: false, error: "One or more messages are too long." };
    }
    totalChars += m.content.length;
  }
  if (totalChars > CHAT_MAX_TOTAL_CONTENT_CHARS) {
    return { ok: false, error: "Conversation payload is too large." };
  }

  return { ok: true, messages };
}

function chatProvider() {
  const pref = String(process.env.CHAT_PROVIDER || "").toLowerCase().trim();
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (pref === "openai" && openai) return { type: "openai", key: openai };
  if (pref === "gemini" && gemini) return { type: "gemini", key: gemini };
  if (gemini) return { type: "gemini", key: gemini };
  if (openai) return { type: "openai", key: openai };
  return null;
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const provider = chatProvider();
  if (!provider) {
    return apiFail(
      {
        code: "AI_PROVIDER_NOT_CONFIGURED",
        message:
          "Live assistant is not configured. Set GEMINI_API_KEY (Google AI Studio) or OPENAI_API_KEY on the server.",
        status: 503,
      },
      context
    );
  }

  const ip = getClientIp(request);
  if (!rateLimitAllow(`chat:${ip}`, { windowMs: 15 * 60 * 1000, max: 40 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests. Try again later.", status: 429 }, context);
  }

  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > CHAT_MAX_BODY_BYTES) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid request.", status: 400 }, context);
  }
  if (Buffer.byteLength(rawText, "utf8") > CHAT_MAX_BODY_BYTES) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON body.", status: 400 }, context);
  }

  const normalized = normalizeMessages(body?.messages);
  if (!normalized.ok) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: normalized.error, status: 400 }, context);
  }

  if (!chatDailyQuotaAllow(ip)) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Daily assistant limit reached. Try again tomorrow.", status: 429 }, context);
  }

  const model = pickModel(body?.model);
  const boundedMessages = normalized.messages;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    if (provider.type === "gemini") {
      const geminiModel =
        typeof body?.model === "string" && body.model.startsWith("gemini") ? body.model : defaultGeminiModel;
      const result = await geminiChatCompletion(systemPrompt, boundedMessages, {
        apiKey: provider.key,
        model: geminiModel,
        signal: controller.signal,
      });
      if (!result.ok) {
        return apiFail(
          {
            code: "GEMINI_ERROR",
            message: result.error || "Gemini error.",
            status: result.status >= 400 && result.status < 600 ? result.status : 502,
          },
          context
        );
      }
      return apiOk(result.body, context, { status: 200 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        messages: [{ role: "system", content: systemPrompt }, ...boundedMessages],
      }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) {
      return apiFail(
        {
          code: API_ERROR_CODES.UPSTREAM_ERROR,
          message: String(data?.error?.message || data?.error || `openai_error_${response.status}`),
          status: response.status,
        },
        context
      );
    }
    return apiOk(data, context, { status: response.status });
  } catch (error) {
    if (error?.name === "AbortError") {
      return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "AI request timed out. Please try again.", status: 504 }, context);
    }
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "AI assistant is currently unavailable.", status: 502 }, context);
  } finally {
    clearTimeout(timeout);
  }
}
