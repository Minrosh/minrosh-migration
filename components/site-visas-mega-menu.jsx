import Link from "next/link";
import conversionSignals from "../data/visas-mega-conversion-signals.json";

const COLUMNS = [
  {
    title: "Skilled & points",
    badge: "S",
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
    badge: "P",
    links: [
      { href: "/partner-visa-australia", label: "Partner visa Australia" },
      { href: "/partner-visa-820-801-guide", label: "820 / 801 onshore guide" },
      { href: "/partner-visa-309-100-guide", label: "309 / 100 offshore guide" },
    ],
    hint: "Evidence and pathway planning",
  },
  {
    title: "Study, work, visit",
    badge: "W",
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
    badge: "G",
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
  const trustSignals = Array.isArray(conversionSignals?.trustSignals) ? conversionSignals.trustSignals : [];
  const intentShortcuts = Array.isArray(conversionSignals?.intentShortcuts) ? conversionSignals.intentShortcuts : [];

  return (
    <details className="visas-mega">
      <summary className="visas-mega__summary">
        Australian visas
        <span className="visas-mega__summary-chip">Popular routes</span>
        <span className="visas-mega__chevron" aria-hidden="true" />
      </summary>
      <div className="visas-mega__panel" role="region" aria-label="Australian visa pathways">
        <div className="visas-mega__hero">
          <p className="visas-mega__hero-label">Pathway navigator</p>
          <p className="visas-mega__hero-copy">
            Choose the lane that matches your intent, then move with official-source clarity.
          </p>
          {trustSignals.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Visa pathway trust signals">
              {trustSignals.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-sm font-bold text-white">{item.value}</p>
                  <p className="text-xs text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="visas-mega__grid">
          {COLUMNS.map((col) => (
            <div key={col.title} className="visas-mega__column">
              <p className="visas-mega__column-title">
                <span className="visas-mega__column-badge" aria-hidden="true">
                  {col.badge}
                </span>
                <span>{col.title}</span>
              </p>
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
          <p className="visas-mega__footer-proof">Trusted flow: quiz → strategy → consultation-ready submission</p>
          {intentShortcuts.length ? (
            <div className="flex flex-wrap gap-2">
              {intentShortcuts.map((shortcut) => (
                <Link
                  key={shortcut.id}
                  href={shortcut.href}
                  className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {shortcut.label}
                </Link>
              ))}
            </div>
          ) : null}
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
