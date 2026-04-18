import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const text = String(body?.text || "").trim();
  const target = String(body?.target || "si").trim();
  if (!text) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "text required", status: 400 }, context);
  }

  const apiKey = String(process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
  if (!apiKey) {
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Translation not configured", status: 503 }, context);
  }

  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target, format: "text" }),
      cache: "no-store",
    });
    const data = await res.json();
    const translated = data?.data?.translations?.[0]?.translatedText || "";
    if (!translated) {
      return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Translation failed", status: 502 }, context);
    }
    return apiOk({ translatedText: translated, target }, context);
  } catch {
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Translation request failed", status: 502 }, context);
  }
}
