import Link from "next/link";

const LINKS = [
  { href: "/australian-visas-official-sources", label: "Australian visas hub" },
  { href: "/skilled-migration", label: "Skilled migration overview" },
  { href: "/skilled-migration-australia-points-guide", label: "Points test guide" },
  { href: "/student-visa-australia", label: "Student visa Australia" },
  { href: "/partner-visa-australia", label: "Partner visa Australia" },
  { href: "/employer-sponsored-visas", label: "Employer-sponsored" },
  { href: "/visitor-visas", label: "Visitor visas" },
];

/**
 * @param {{ currentPath?: string }} props
 */
export function VisaRailSkilledAu({ currentPath = "" }) {
  return (
    <nav className="visa-rail-skilled-au" aria-label="Australian visa pathway shortcuts">
      <p className="visa-rail-skilled-au__label">Jump to</p>
      <ul className="visa-rail-skilled-au__list">
        {LINKS.map((item) => {
          const active = currentPath === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`visa-rail-skilled-au__link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
