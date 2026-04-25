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
      { href: "/student-visa-australia-requirements", label: "Visa Requirements" },
      { href: "/education-consultation", label: "Book Education Consultation" },
    ]
  }
};

export function HubClusterNavigator({ category, currentPath = "", className = "" }) {
  const hub = clusters[category];
  if (!hub) return null;

  return (
    <div className={`my-12 p-8 rounded-[2.5rem] bg-brand-plum text-white shadow-2xl ${className}`}>
      <div className="max-w-3xl">
        <h2 className="text-3xl font-extrabold mb-4">{hub.title}</h2>
        <p className="text-brand-cream/70 mb-8 text-lg">{hub.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hub.links.map((link) => (
            link.href === currentPath ? (
              <span
                key={link.href}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/20 border border-white/30"
                aria-current="page"
              >
                <span className="font-semibold">{link.label}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-cream/80">Current page</span>
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all group"
              >
                <span className="font-semibold">{link.label}</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
