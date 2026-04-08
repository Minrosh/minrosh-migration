export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = String(body?.text || "").trim();
  const target = String(body?.target || "si").trim();
  if (!text) return Response.json({ error: "text required" }, { status: 400 });

  const apiKey = String(process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
  if (!apiKey) return Response.json({ error: "Translation not configured" }, { status: 503 });

  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target, format: "text" }),
      cache: "no-store",
    });
    const data = await res.json();
    const translated = data?.data?.translations?.[0]?.translatedText || "";
    if (!translated) return Response.json({ error: "Translation failed" }, { status: 502 });
    return Response.json({ translatedText: translated, target });
  } catch {
    return Response.json({ error: "Translation request failed" }, { status: 502 });
  }
}
