const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = process.env.GEMINI_INTELLIGENCE_MODEL || "gemini-2.5-flash";
const LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Mandarin Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ta", label: "Tamil" },
];

function parseJsonFromText(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function geminiGenerate({ prompt, apiKey, model = DEFAULT_MODEL, signal }) {
  const url = `${GEMINI_API_ROOT}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 1400 },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: data?.error?.message || `gemini_http_${response.status}` };
  }
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || "")
      .join("")
      .trim() || "";
  if (!text) return { ok: false, error: "empty_generation" };
  return { ok: true, text };
}

export async function generateDraftWithGemini({ source, sourceText }) {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return { ok: false, error: "missing_gemini_api_key" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const prompt = [
      "You are generating a migration policy update draft for a human-reviewed newsroom.",
      "Use only the provided official source URL and source excerpt.",
      "Return STRICT JSON only with keys: headline, summary, body, seoTitle, seoDescription, faqSuggestions, groundingConfidence, citations.",
      "faqSuggestions must be an array of {question, answer} with max 3 items.",
      "groundingConfidence must be a number between 0 and 1.",
      "citations must be an array of up to 5 items shaped as {url, quote}.",
      "",
      `Country: ${source.country}`,
      `Source name: ${source.name}`,
      `Source URL: ${source.url}`,
      `Source excerpt:\n${String(sourceText || "").slice(0, 6000)}`,
    ].join("\n");
    const generated = await geminiGenerate({
      prompt,
      apiKey,
      signal: controller.signal,
    });
    if (!generated.ok) return generated;
    const parsed = parseJsonFromText(generated.text);
    if (!parsed) return { ok: false, error: "invalid_json_from_gemini" };

    const translations = {};
    for (const lang of LANGUAGES) {
      const tPrompt = [
        `Translate the following text into ${lang.label}.`,
        "Return STRICT JSON only with keys headline and summary.",
        `Headline: ${parsed.headline || ""}`,
        `Summary: ${parsed.summary || ""}`,
      ].join("\n");
      const tRes = await geminiGenerate({ prompt: tPrompt, apiKey, signal: controller.signal });
      if (!tRes.ok) continue;
      const tParsed = parseJsonFromText(tRes.text);
      if (!tParsed) continue;
      translations[lang.code] = {
        language: lang.label,
        headline: String(tParsed.headline || "").trim(),
        summary: String(tParsed.summary || "").trim(),
      };
    }

    return {
      ok: true,
      draft: {
        headline: String(parsed.headline || "").trim(),
        summary: String(parsed.summary || "").trim(),
        body: String(parsed.body || "").trim(),
        seoTitle: String(parsed.seoTitle || parsed.headline || "").trim(),
        seoDescription: String(parsed.seoDescription || parsed.summary || "").trim(),
        faqSuggestions: Array.isArray(parsed.faqSuggestions) ? parsed.faqSuggestions.slice(0, 3) : [],
        groundingConfidence: Number(parsed.groundingConfidence || 0.75),
        citations: Array.isArray(parsed.citations) ? parsed.citations.slice(0, 5) : [],
        translations,
      },
    };
  } catch (error) {
    return { ok: false, error: String(error?.name || error?.message || "gemini_generation_failed") };
  } finally {
    clearTimeout(timeout);
  }
}
