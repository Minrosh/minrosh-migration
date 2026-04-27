import Link from "next/link";

export function MidContentCTA({
  title = "Check your eligibility now",
  description = "Find out which visa pathway suits your background in less than 2 minutes.",
  buttonText = "Start Free Assessment",
  buttonLink = "/assessment",
  className = "",
}) {
  return (
    <div className={`my-10 overflow-hidden rounded-2xl border border-brand-plum/10 bg-gradient-to-r from-brand-cream/80 to-zinc-50 p-6 shadow-sm sm:p-8 ${className}`}>
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-brand-plum sm:text-2xl">{title}</h3>
          <p className="mt-2 text-brand-plum/70">{description}</p>
        </div>
        <div className="flex shrink-0">
          <Link
            href={buttonLink}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-rose px-6 py-3 text-center text-sm font-bold text-white shadow-md shadow-brand-rose/25 transition-transform hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose/50"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
