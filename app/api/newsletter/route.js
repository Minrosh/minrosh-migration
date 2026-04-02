import { saveNewsletterEntry } from "../../../lib/newsletter";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = saveNewsletterEntry(body?.email);
  if (result.error) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({
    ok: true,
    exists: result.exists || false,
    message: result.exists
      ? "This email is already subscribed."
      : "Thanks for subscribing. You will receive migration and visa updates by email.",
  });
}
