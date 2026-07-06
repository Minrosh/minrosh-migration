import Link from "next/link";

const clusters = {
  skilled: {
    title: "Skilled Migration Hub",
    description: "Your comprehensive guide to Australian skilled work visas, points tests, and occupation lists.",
    links: [
      { href: "/skilled-migration", label: "Skilled Migration Overview" },
      { href: "/skilled-migration-australia-points-guide", label: "Points Test Guide" },
      { href: "/assessment", label: "Free Eligibility Assessment" },
    ]
  },
  partner: {
    title: "Partner Visa Hub",
    description: "Everything you need to know about bringing your partner to Australia, from evidence to lodgement.",
    links: [
      { href: "/partner-visa-australia", label: "Partner Visa Overview" },
      { href: "/partner-visa-australia-guide", label: "Comprehensive Guide" },
      { href: "/partner-visa-820-801-guide", label: "Onshore (820/801) Guide" },
      { href: "/partner-visa-309-100-guide", label: "Offshore (309/100) Guide" },
    ]
  },
  student: {
    title: "Student Visa Hub",
    description: "Start your Australian education journey with our student visa requirements and course guides.",
    links: [
      { href: "/student-visa-australia", label: "Student Visa Overview" },
      { href: "/post-study-visa-australia", label: "Post-Study Visa Guide" },
      { href: "/student-visa-australia-requirements", label: "Visa Requirements" },
      { href: "/education-consultation", label: "Book Education Consultation" },
    ]
  }
};

export function HubClusterNavigator({ category, currentPath = "", className = "" }) {
  const hub = clusters[category];
  if (!hub) return null;

  return (
    <div
      className={`my-10 rounded-2xl bg-brand-plum p-5 text-white shadow-2xl sm:my-12 sm:rounded-[2.5rem] sm:p-8 ${className}`}
    >
      <div className="max-w-3xl min-w-0">
        <h2 className="mb-3 text-2xl font-extrabold sm:mb-4 sm:text-3xl">{hub.title}</h2>
        <p className="mb-6 text-base text-brand-cream/70 sm:mb-8 sm:text-lg">{hub.description}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {hub.links.map((link) =>
            link.href === currentPath ? (
              <span
                key={link.href}
                className="flex min-h-[48px] flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/30 bg-white/20 px-4 py-3"
                aria-current="page"
              >
                <span className="min-w-0 font-semibold leading-snug">{link.label}</span>
                <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-brand-cream/80">
                  Current page
                </span>
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-[48px] touch-manipulation items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition-all hover:bg-white/20"
              >
                <span className="min-w-0 font-semibold leading-snug">{link.label}</span>
                <span className="shrink-0 text-xl transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
