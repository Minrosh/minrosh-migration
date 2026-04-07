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

const systemPrompt = `You are the MinRosh Migration Assistant for minroshmigration.com.au.

Your job:
1. Read the user's latest message carefully and infer their goal (e.g. skilled migration, student visa, partner/family, employer-sponsored, visitor, or country comparison).
2. Reply in clear, plain English with short paragraphs or bullet points when helpful.
3. Give practical "next step" suggestions (documents to gather, questions to clarify, whether consultation may help).
4. Never present yourself as a lawyer or registered migration agent; do not claim you can guarantee an outcome.
5. When discussing Australian visas, remind the user that eligibility, charges, and rules must be verified on the Department of Home Affairs website.
6. For New Zealand, Canada, or the UK, point users to their official immigration sites rather than inventing detailed rules.
7. If the question is ambiguous, ask one or two focused clarifying questions at the end.

Official reference URLs (for suggestions only; do not quote long text from them):
- Australia visa listing: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing
- Canada visit/entry: https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html
- UK visas: https://www.gov.uk/browse/visas-immigration
- New Zealand find a visa: https://www.immigration.govt.nz/process-to-apply/find-a-visa-tool/

Internal site pages you may mention when relevant: /skilled-migration, /migration-sri-lanka-to-australia, /student-visa-australia, /partner-visa-australia, /book-consultation, /assessment, /destinations/australia, /destinations/new-zealand, /destinations/canada, /destinations/united-kingdom`;

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
  const provider = chatProvider();
  if (!provider) {
    return Response.json(
      {
        error:
          "Live assistant is not configured. Set GEMINI_API_KEY (Google AI Studio) or OPENAI_API_KEY on the server.",
        code: "AI_PROVIDER_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  if (!rateLimitAllow(`chat:${ip}`, { windowMs: 15 * 60 * 1000, max: 40 })) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > CHAT_MAX_BODY_BYTES) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (Buffer.byteLength(rawText, "utf8") > CHAT_MAX_BODY_BYTES) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const normalized = normalizeMessages(body?.messages);
  if (!normalized.ok) {
    return Response.json({ error: normalized.error }, { status: 400 });
  }

  if (!chatDailyQuotaAllow(ip)) {
    return Response.json({ error: "Daily assistant limit reached. Try again tomorrow." }, { status: 429 });
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
        return Response.json(
          { error: result.error || "Gemini error.", code: "GEMINI_ERROR" },
          { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
        );
      }
      return Response.json(result.body, { status: 200 });
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
    return Response.json(data, { status: response.status });
  } catch (error) {
    if (error?.name === "AbortError") {
      return Response.json({ error: "AI request timed out. Please try again." }, { status: 504 });
    }
    return Response.json({ error: "AI assistant is currently unavailable." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
