export const nurtureSequences = {
  ai_funnel: {
    name: "AI Navigator Nurture",
    steps: [
      {
        id: "step_1",
        delayMs: 0, // Instant
        subject: "Your Personalised Migration Pathway Analysis",
        template: "ai_analysis_result",
        trackingLink: "/dashboard?utm_source=nurture&utm_medium=email&utm_campaign=step_1"
      },
      {
        id: "step_2",
        delayMs: 24 * 60 * 60 * 1000, // 1 day
        subject: "Understanding your Australian visa requirements",
        template: "visa_requirements_deep_dive",
        trackingLink: "/guides/requirements?utm_source=nurture&utm_medium=email&utm_campaign=step_2"
      },
      {
        id: "step_3",
        delayMs: 3 * 24 * 60 * 60 * 1000, // 3 days
        subject: "Common pitfalls in Australian migration applications",
        template: "migration_pitfalls",
        trackingLink: "/guides/pitfalls?utm_source=nurture&utm_medium=email&utm_campaign=step_3"
      },
      {
        id: "step_4",
        delayMs: 7 * 24 * 60 * 60 * 1000, // 1 week
        subject: "Ready to start? Book your strategic consultation",
        template: "consultation_push",
        trackingLink: "/book-consultation?utm_source=nurture&utm_medium=email&utm_campaign=step_4"
      }
    ]
  }
};

export async function startNurtureSequence(leadId, sequenceId = "ai_funnel") {
  console.log(`[Email Automation] Enqueuing ${sequenceId} for lead ${leadId} with conversion tracking.`);
  // Log the first tracking link as a simulation
  const firstStep = nurtureSequences[sequenceId]?.steps[0];
  console.log(`[Email Automation] Step 1 tracked link: ${firstStep?.trackingLink}&leadId=${leadId}`);
  return { success: true, leadId, sequenceId };
}
