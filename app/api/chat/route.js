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

Internal site pages you may mention when relevant: /skilled-migration, /student-visa-australia, /partner-visa-australia, /book-consultation, /assessment, /destinations/australia, /destinations/new-zealand, /destinations/canada, /destinations/united-kingdom`;

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
        temperature: 0.35,
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
