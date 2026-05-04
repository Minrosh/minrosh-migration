import Link from "next/link";

export function HomePlanningTools() {
  return (
    <section
      className="home-section bg-gradient-to-b from-white via-[#FBF6F4]/90 to-[#FBF6F4]"
      aria-labelledby="home-tools-heading"
    >
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="home-tools-heading"
          className="text-center text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl"
        >
          Planning tools
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
          Educational aids to compare ideas before you invest in preparation.{" "}
          <strong className="font-black text-brand-plum">Indicative only. Not eligibility advice or a guarantee of outcomes.</strong>
        </p>

        <ul className="mt-8 grid min-w-0 list-none grid-cols-1 gap-6 pl-0 md:mt-10 md:grid-cols-2 md:gap-8">
          <li className="min-w-0">
            <Link
              href="/tools/student-country-cost-planner"
              className="flex h-full min-h-[48px] flex-col rounded-[1.75rem] border border-brand-plum/10 bg-white p-6 shadow-[var(--shadow-lux)] transition-all hover:border-brand-rose/28 hover:shadow-[var(--shadow-lux-lg)] sm:p-7"
            >
              <h3 className="text-xl font-black text-brand-plum">Student country cost planner</h3>
              <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65">
                Rough budgeting context across destinations—confirm fees, charges and rules on official sites before you
                decide.
              </p>
              <span className="mt-5 inline-flex min-h-[48px] items-center font-black text-brand-plum underline decoration-2 underline-offset-4">
                Open tool <span className="ml-2">→</span>
              </span>
            </Link>
          </li>
          <li className="min-w-0">
            <Link
              href="/tools/pr-pathway-explorer"
              className="flex h-full min-h-[48px] flex-col rounded-[1.75rem] border border-brand-plum/10 bg-white p-6 shadow-[var(--shadow-lux)] transition-all hover:border-brand-rose/28 hover:shadow-[var(--shadow-lux-lg)] sm:p-7"
            >
              <h3 className="text-xl font-black text-brand-plum">Pathway explorer</h3>
              <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65">
                Explore common long-term residence sequences people discuss—individual eligibility depends on changing
                rules and personal circumstances.
              </p>
              <span className="mt-5 inline-flex min-h-[48px] items-center font-black text-brand-plum underline decoration-2 underline-offset-4">
                Open tool <span className="ml-2">→</span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
