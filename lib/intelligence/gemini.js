const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = process.env.GEMINI_INTELLIGENCE_MODEL || "gemini-2.5-flash";
const LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Mandarin Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ta", label: "Tamil" },
];

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

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

async function geminiGenerate({ prompt, apiKey, model = DEFAULT_MODEL, signal, maxOutputTokens = 1400 }) {
  const url = `${GEMINI_API_ROOT}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens },
    }),
  });
  const data = await parseJsonResponseSafe(response);
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

/**
 * Build structured headline/summary/body from official source text using Gemini.
 * @param {{ source: { country: string, name: string, url: string }, sourceText: string, skipTranslations?: boolean }} params — `skipTranslations` skips five extra API calls (recommended for cron/scan).
 */
export async function generateDraftWithGemini({ source, sourceText, skipTranslations = false } = {}) {
  const skipTranslationsBool = Boolean(skipTranslations);
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return { ok: false, error: "missing_gemini_api_key" };
  const controller = new AbortController();
  const timeoutMs = skipTranslationsBool ? 70_000 : 120_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const maxInput = Math.min(
    120_000,
    Math.max(6_000, Number(process.env.GEMINI_INTEL_SOURCE_CHARS || 36_000)),
  );
  try {
    const prompt = [
      "You are generating a migration policy update draft for a human-reviewed newsroom.",
      "SOURCE MATERIAL may include several blocks separated by a line containing only --- (listing hub plus linked official article pages).",
      "Use ONLY facts that appear in the source material. If something is unclear, say so briefly—do not invent dates, visa subclasses, or policy details.",
      "Write in clear Australian English suitable for migrants; tone factual and cautious (e.g. 'the department states…').",
      "Return STRICT JSON only with keys: headline, summary, body, seoTitle, seoDescription, faqSuggestions, groundingConfidence, citations.",
      "headline: max 120 characters, specific to what changed or was announced if visible.",
      "summary: 2–4 sentences for the site news card.",
      "body: 2–5 short paragraphs for the news article; no HTML; no markdown headings required.",
      "faqSuggestions must be an array of {question, answer} with max 3 items, grounded in the source.",
      "groundingConfidence must be a number between 0 and 1 (lower if the source text is vague or fragmented).",
      "citations must be an array of up to 5 items shaped as {url, quote} where quote is a short verbatim snippet from the source (or empty string if not available).",
      "",
      `Country: ${source.country}`,
      `Source name: ${source.name}`,
      `Hub URL (index page): ${source.url}`,
      `Source material:\n${String(sourceText || "").slice(0, maxInput)}`,
    ].join("\n");
    const generated = await geminiGenerate({
      prompt,
      apiKey,
      signal: controller.signal,
      maxOutputTokens: skipTranslationsBool ? 6144 : 2048,
    });
    if (!generated.ok) return generated;
    const parsed = parseJsonFromText(generated.text);
    if (!parsed) return { ok: false, error: "invalid_json_from_gemini" };

    const translations = {};
    if (!skipTranslationsBool) {
      for (const lang of LANGUAGES) {
        const tPrompt = [
          `Translate the following text into ${lang.label}.`,
          "Return STRICT JSON only with keys headline and summary.",
          `Headline: ${parsed.headline || ""}`,
          `Summary: ${parsed.summary || ""}`,
        ].join("\n");
        const tRes = await geminiGenerate({
          prompt: tPrompt,
          apiKey,
          signal: controller.signal,
          maxOutputTokens: 512,
        });
        if (!tRes.ok) continue;
        const tParsed = parseJsonFromText(tRes.text);
        if (!tParsed) continue;
        translations[lang.code] = {
          language: lang.label,
          headline: String(tParsed.headline || "").trim(),
          summary: String(tParsed.summary || "").trim(),
        };
      }
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
