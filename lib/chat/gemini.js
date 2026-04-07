/**
 * Google AI Studio / Gemini REST (generateContent). Returns OpenAI-shaped JSON for the web client.
 */

const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Gemini expects contents alternating user/model and starting with user. Strip UI welcome assistant
 * lines and merge consecutive same-role turns.
 * @param {{ role: string, content: string }[]} messages
 */
function openAiMessagesToGeminiContents(messages) {
  const rest = [...messages];
  while (rest.length && rest[0].role === "assistant") {
    rest.shift();
  }
  /** @type {{ role: string, parts: { text: string }[] }[]} */
  const contents = [];
  for (const m of rest) {
    const role = m.role === "assistant" ? "model" : "user";
    const text = String(m.content || "").trim();
    if (!text) continue;
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }
  return contents;
}

/**
 * @param {string} systemPrompt
 * @param {{ role: string, content: string }[]} messages
 * @param {{ apiKey: string, model: string, signal?: AbortSignal }} opts
 */
export async function geminiChatCompletion(systemPrompt, messages, opts) {
  const { apiKey, model, signal } = opts;
  const contents = openAiMessagesToGeminiContents(messages);
  if (!contents.length) {
    return { ok: false, status: 400, error: "No user messages to send to Gemini." };
  }

  const url = `${GEMINI_API_ROOT}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 1024,
      },
    }),
    signal,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.status ||
      `Gemini request failed (${response.status})`;
    return { ok: false, status: response.status, error: msg, raw: data };
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    return {
      ok: false,
      status: 502,
      error: "Gemini returned an empty reply.",
      raw: data,
    };
  }

  const openAiShaped = {
    id: `gemini-${Date.now()}`,
    object: "chat.completion",
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      },
    ],
  };

  return { ok: true, status: 200, body: openAiShaped };
}
