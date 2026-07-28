import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { rateLimitAllow } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";

const MAX_TEXT_CHARS = 5000;
const MAX_BODY_BYTES = 12 * 1024;

export const ALLOWED_TARGET_LANGUAGES = new Set(["si", "ta", "hi", "en"]);

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`translate:${ip}`, { windowMs: 15 * 60 * 1000, max: 30 })) {
    return apiFail(
      { code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests. Try again later.", status: 429 },
      context
    );
  }

  const cl = request.headers.get("content-length");
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid request.", status: 400 }, context);
  }
  if (Buffer.byteLength(rawText, "utf8") > MAX_BODY_BYTES) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Request too large.", status: 413 }, context);
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  const text = String(body?.text || "").trim();
  const target = String(body?.target || "si").trim().toLowerCase();

  if (!text) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "text required", status: 400 }, context);
  }
  if (text.length > MAX_TEXT_CHARS) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "text too long", status: 400 }, context);
  }
  if (!ALLOWED_TARGET_LANGUAGES.has(target)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid target language.", status: 400 }, context);
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
