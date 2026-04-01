import { saveEnquiry, sendContactEmails, validateContact } from "../../../lib/contact";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateContact(body);
  if (validated.error) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  saveEnquiry(validated.value);

  try {
    const mailResult = await sendContactEmails(validated.value);
    return Response.json({
      ok: true,
      id: validated.value.id,
      internalSent: mailResult.internalSent,
      thankYouSent: mailResult.thankYouSent,
      brochureAttached: mailResult.brochureAttached || false,
      warning:
        mailResult.reason === "smtp_not_configured"
          ? "Enquiry saved, but SMTP is not configured yet."
          : undefined,
    });
  } catch (error) {
    return Response.json({
      ok: true,
      id: validated.value.id,
      internalSent: false,
      thankYouSent: false,
      warning: `Enquiry saved, but email delivery failed: ${error.message}`,
    });
  }
}
