import Link from "next/link";

const COLUMNS = [
  {
    title: "Skilled & points",
    links: [
      { href: "/australian-visas-official-sources", label: "Visa list & official sources" },
      { href: "/skilled-migration", label: "Skilled migration overview" },
      { href: "/skilled-migration-australia-points-guide", label: "Australia points guide" },
      { href: "/migration-sri-lanka-to-australia", label: "Sri Lanka → Australia" },
    ],
    hint: "189 · 190 · 491 · SkillSelect / EOI",
  },
  {
    title: "Partner & family",
    links: [
      { href: "/partner-visa-australia", label: "Partner visa Australia" },
      { href: "/partner-visa-820-801-guide", label: "820 / 801 onshore guide" },
      { href: "/partner-visa-309-100-guide", label: "309 / 100 offshore guide" },
    ],
    hint: "Evidence and pathway planning",
  },
  {
    title: "Study, work, visit",
    links: [
      { href: "/student-visa-australia", label: "Student visa (subclass 500)" },
      { href: "/education-consultation", label: "Education consultation" },
      { href: "/employer-sponsored-visas", label: "Employer-sponsored visas" },
      { href: "/visitor-visas", label: "Visitor visas" },
    ],
    hint: "CoE, sponsorship context, travel purpose",
  },
  {
    title: "Guides & complex cases",
    links: [
      { href: "/australia-visa-document-checklist-guide", label: "Document checklist" },
      { href: "/visa-refusal-help-australia-and-aat-migration-appeal-guide", label: "Refusal & AAT context" },
      { href: "/immigration-lawyer-australia-vs-registered-migration-agent-guide", label: "Lawyer vs migration agent" },
    ],
    hint: "Authority, review rights, adviser choice",
  },
];

/**
 * Desktop mega menu: wide panel for Australian visa pathways (hidden below 921px via CSS).
 */
export function SiteVisasMegaMenu() {
  return (
    <details className="visas-mega">
      <summary className="visas-mega__summary">
        Australian visas
        <span className="visas-mega__chevron" aria-hidden="true" />
      </summary>
      <div className="visas-mega__panel" role="region" aria-label="Australian visa pathways">
        <div className="visas-mega__grid">
          {COLUMNS.map((col) => (
            <div key={col.title} className="visas-mega__column">
              <p className="visas-mega__column-title">{col.title}</p>
              <ul className="visas-mega__list">
                {col.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="visas-mega__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {col.hint ? <p className="visas-mega__hint">{col.hint}</p> : null}
            </div>
          ))}
        </div>
        <div className="visas-mega__footer">
          <Link href="/book-consultation" className="visas-mega__footer-cta">
            Book consultation
          </Link>
          <Link href="/assessment" className="visas-mega__footer-cta visas-mega__footer-cta--ghost">
            Free assessment
          </Link>
        </div>
      </div>
    </details>
  );
}
