import Link from "next/link";

const comparisonSteps = [
  {
    id: "goal",
    title: "Define your goal",
    description: "Work rights, study, partner reunion, or long-term PR pathway.",
    chips: ["Timeline", "Budget", "Urgency"],
  },
  {
    id: "eligibility",
    title: "Check eligibility lane",
    description: "Compare points-tested, partner, student, and employer-sponsored directions.",
    chips: ["Points fit", "Evidence load", "Risk level"],
  },
  {
    id: "action",
    title: "Pick your next action",
    description: "Use the free assessment first, then move to a focused consultation if needed.",
    chips: ["Self-check", "Document map", "Booking decision"],
  },
];

export function HomeVisaComparisonFlowchart() {
  return (
    <section className="ultra-snap-section bg-brand-cream/30">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="rounded-[2rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-rose">Visa comparison flow</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-brand-plum sm:text-4xl">
            Compare pathways in one clear flow.
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
            This gives a simple decision sequence before you commit to full preparation. It is an orientation tool, not
            legal advice.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {comparisonSteps.map((step, index) => (
              <article key={step.id} className="rounded-2xl border border-brand-plum/10 bg-white p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-rose/80">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-black text-brand-plum">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-brand-plum/70">{step.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-brand-plum/15 bg-brand-cream/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-plum/70"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/assessment" className="btn btn-primary">
              Start free assessment
            </Link>
            <Link href="/book-consultation" className="btn btn-ghost">
              Compare with consultant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
