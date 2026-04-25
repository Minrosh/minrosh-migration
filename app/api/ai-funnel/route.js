import { createLead } from "../../../lib/crm/leads-service";
import { apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";
import { startNurtureSequence } from "../../../lib/nurture-sequences-ai";

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  
  if (!rateLimitAllow(`ai-funnel:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })) {
    return apiFail({ code: "RATE_LIMITED", message: "Too many requests. Try again later.", status: 429 }, context);
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
      message: `AI Navigator v2 Insights:
- Why: ${insights?.why?.join(", ") || "N/A"}
- Risks: ${insights?.risks?.join(", ") || "N/A"}
- Timeline: ${insights?.timelineExpectation || "N/A"}
- Raw Answers: ${JSON.stringify(answers)}`,
      quizCompleted: true,
      quizCompletionDepth: 10,
    });

    // Trigger email nurture sequence
    await startNurtureSequence(lead.id, "ai_funnel");

    return apiOk({
      success: true,
      leadId: lead.id,
    }, context);
  } catch (error) {
    console.error("AI Funnel lead capture error:", error);
    return apiOk({
      success: false,
      message: "Lead capture failed, but session is tracked.",
    }, context);
  }
}
