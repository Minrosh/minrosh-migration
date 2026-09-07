import { COMPLIANCE_FEATURE_FLAGS } from "@/lib/compliance";

export const nurtureSequences = {
  ai_funnel: {
    name: "General Information Follow-up",
    steps: [
      {
        id: "step_1",
        delayMs: 0,
        subject: "General migration information resources from MinRosh",
        template: "general_information_resources",
        trackingLink: "/assessment?utm_source=nurture&utm_medium=email&utm_campaign=step_1",
      },
      {
        id: "step_2",
        delayMs: 24 * 60 * 60 * 1000,
        subject: "Official sources for Australian visa category research",
        template: "official_sources_overview",
        trackingLink: "/australian-visas-official-sources?utm_source=nurture&utm_medium=email&utm_campaign=step_2",
      },
      {
        id: "step_3",
        delayMs: 3 * 24 * 60 * 60 * 1000,
        subject: "Education course enquiry and admissions support",
        template: "education_enquiry_followup",
        trackingLink: "/education-consultation?utm_source=nurture&utm_medium=email&utm_campaign=step_3",
      },
      {
        id: "step_4",
        delayMs: 7 * 24 * 60 * 60 * 1000,
        subject: "Book a general information or education discussion",
        template: "information_discussion_invite",
        trackingLink: "/book-information-session?utm_source=nurture&utm_medium=email&utm_campaign=step_4",
      },
    ],
  },
};

export async function startNurtureSequence(leadId, sequenceId = "ai_funnel") {
  if (!COMPLIANCE_FEATURE_FLAGS.AI_PATHWAY_FUNNEL) {
    console.log(
      `[Email Automation] AI pathway nurture disabled (ENABLE_AI_PATHWAY_FUNNEL!=true). No-op for lead ${leadId}.`
    );
    return { success: false, disabled: true, leadId, sequenceId };
  }
  console.log(`[Email Automation] Enqueuing ${sequenceId} for lead ${leadId} with conversion tracking.`);
  const firstStep = nurtureSequences[sequenceId]?.steps[0];
  console.log(`[Email Automation] Step 1 tracked link: ${firstStep?.trackingLink}&leadId=${leadId}`);
  return { success: true, leadId, sequenceId };
}
