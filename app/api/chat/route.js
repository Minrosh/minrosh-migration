const systemPrompt =
  "You are the MinRosh Migration Assistant. Provide clear, plain-language preliminary information about Australian visa pathways. Do not present your responses as legal advice.";

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
          typeof item.content === "string"
      )
    : [];

  const model = typeof body?.model === "string" ? body.model : "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
