import { apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";
import { COMPLIANCE_FEATURE_FLAGS } from "@/lib/compliance";
import { createLead } from "../../../lib/crm/leads-service";
import { startNurtureSequence } from "../../../lib/nurture-sequences-ai";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);

  if (!rateLimitAllow(`ai-funnel:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
    return apiFail({ code: "RATE_LIMITED", message: "Too many requests. Try again later.", status: 429 }, context);
  }

  if (!COMPLIANCE_FEATURE_FLAGS.AI_PATHWAY_FUNNEL) {
    return apiFail(
      {
        code: "FEATURE_DISABLED",
        message:
          "Personalised pathway analysis is disabled. Use the Official Information Finder or contact form for general information / education enquiries.",
        status: 410,
      },
      context
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: "VALIDATION_FAILED", message: "Invalid JSON body.", status: 400 }, context);
  }

  const { email, country, goal, answers, insights } = body;

  if (!email) {
    return apiFail({ code: "VALIDATION_FAILED", message: "Email is required.", status: 400 }, context);
  }

  try {
    const lead = createLead({
      source: "ai_navigator_funnel",
      email: email,
      preferredCountry: country,
      mainNeed: goal,
      goal,
      message: `AI funnel capture (authorised mode only):
- Why: ${insights?.why?.join(", ") || "N/A"}
- Risks: ${insights?.risks?.join(", ") || "N/A"}
- Timeline: ${insights?.timelineExpectation || "N/A"}
- Raw Answers: ${JSON.stringify(answers)}`,
      quizCompleted: true,
      quizCompletionDepth: 10,
    });

    await startNurtureSequence(lead.id, "ai_funnel");

    return apiOk(
      {
        success: true,
        leadId: lead.id,
      },
      context
    );
  } catch (error) {
    console.error("AI Funnel lead capture error:", error);
    return apiOk(
      {
        success: false,
        message: "Lead capture failed, but session is tracked.",
      },
      context
    );
  }
}
