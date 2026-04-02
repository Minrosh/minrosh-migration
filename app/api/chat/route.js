const systemPrompt =
  "You are the MinRosh Migration Assistant. Provide clear, plain-language preliminary information about Australian visa pathways. Do not present your responses as legal advice.";
const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const requestTimeoutMs = 20000;

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "OPENAI_API_KEY is not set. Start the server with that environment variable to enable chat.",
      },
      { status: 500 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages)
    ? body.messages.filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim()
      )
    : [];

  const model = typeof body?.model === "string" ? body.model : defaultModel;
  const boundedMessages = messages.slice(-20);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{ role: "system", content: systemPrompt }, ...boundedMessages],
      }),
      signal: controller.signal,
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    if (error?.name === "AbortError") {
      return Response.json(
        { error: "AI request timed out. Please try again." },
        { status: 504 }
      );
    }
    return Response.json(
      { error: "AI assistant is currently unavailable." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
