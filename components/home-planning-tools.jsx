import Link from "next/link";

export function HomePlanningTools() {
  return (
    <section className="home-section" aria-labelledby="home-tools-heading">
      <div className="relative isolate mx-auto w-full min-w-0 overflow-hidden rounded-[2rem] border border-brand-plum/10 bg-gradient-to-b from-white via-[#FBF6F4]/90 to-[#FBF6F4] p-5 shadow-[var(--shadow-lux)] sm:p-7">
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
          aria-hidden
          style={{
            background:
              "radial-gradient(120% 90% at 0% 0%, rgba(139,29,65,0.09) 0%, rgba(139,29,65,0) 46%), radial-gradient(120% 90% at 100% 100%, rgba(202,166,77,0.1) 0%, rgba(202,166,77,0) 48%), radial-gradient(130% 100% at 50% 0%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 62%), radial-gradient(120% 100% at 50% 100%, rgba(136,19,55,0.05) 0%, rgba(136,19,55,0) 65%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full min-w-0">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-brand-rose">Student planning</p>
        <h2
          id="home-tools-heading"
          className="mt-3 text-center text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl"
        >
          Know costs before you apply
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
          Know your course cost, living cost, work income and PR options before you apply.{" "}
          <strong className="font-black text-brand-plum">Planning estimates only—not eligibility advice.</strong>
        </p>

        <ul className="mt-8 grid min-w-0 list-none grid-cols-1 gap-[clamp(24px,4vw,48px)] pl-0 md:mt-10 md:grid-cols-2">
          <li className="min-w-0">
            <Link
              href="/tools/student-country-cost-planner"
              className="premium-frosted-surface flex h-full min-h-[48px] flex-col rounded-[1.75rem] border border-brand-rose/18 bg-gradient-to-b from-white to-brand-rose/[0.04] p-6 shadow-[var(--shadow-lux)] transition-all hover:border-brand-rose/28 hover:shadow-[var(--shadow-lux-lg)] sm:p-7"
            >
              <h3 className="text-xl font-black text-brand-plum">Student country cost planner</h3>
              <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65">
                Compare tuition, living costs, work income bands and PR pathway notes across Australia, Canada, the UK
                and New Zealand—before you commit to a course.
              </p>
              <span className="mt-5 inline-flex min-h-[48px] items-center font-black text-brand-plum underline decoration-2 underline-offset-4">
                Open tool <span className="ml-2">→</span>
              </span>
            </Link>
          </li>
          <li className="min-w-0">
            <Link
              href="/tools/pr-pathway-explorer"
              className="premium-frosted-surface flex h-full min-h-[48px] flex-col rounded-[1.75rem] border border-brand-gold/30 bg-gradient-to-b from-white to-brand-gold/[0.06] p-6 shadow-[var(--shadow-lux)] transition-all hover:border-brand-rose/28 hover:shadow-[var(--shadow-lux-lg)] sm:p-7"
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
      </div>
    </section>
  );
}
