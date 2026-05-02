 "use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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
  const menuRef = useRef(null);
  const intentShortcuts = Array.isArray(conversionSignals?.intentShortcuts) ? conversionSignals.intentShortcuts : [];

  useEffect(() => {
    function closeOnOutsideClick(event) {
      const root = menuRef.current;
      if (!root || !root.open) return;
      if (!root.contains(event.target)) {
        root.open = false;
      }
    }

    function closeOnEscape(event) {
      const root = menuRef.current;
      if (!root || !root.open) return;
      if (event.key === "Escape") {
        root.open = false;
      }
    }

    function closeOnMenuLinkClick(event) {
      const root = menuRef.current;
      if (!root || !root.open) return;
      const target = event.target;
      if (target instanceof Element && target.closest("a")) {
        root.open = false;
      }
    }

    const root = menuRef.current;
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick, { passive: true });
    window.addEventListener("keydown", closeOnEscape);
    root?.addEventListener("click", closeOnMenuLinkClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
      root?.removeEventListener("click", closeOnMenuLinkClick);
    };
  }, []);

  return (
    <details ref={menuRef} className="visas-mega">
      <summary className="visas-mega__summary">
        POPULAR ROUTES
        <span className="visas-mega__chevron" aria-hidden="true" />
      </summary>
      <div className="visas-mega__panel" role="region" aria-label="Australian visa pathways">
        <div className="visas-mega__hero">
          <p className="visas-mega__hero-label">Pathway navigator</p>
          <h3 className="visas-mega__hero-title">Find the right visa lane in under a minute</h3>
          <p className="visas-mega__hero-copy">
            Choose the lane that matches your intent, then move with official-source clarity and a
            practical next step.
          </p>
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
                      <span>{item.label}</span>
                      <span className="visas-mega__link-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {col.hint ? <p className="visas-mega__hint">{col.hint}</p> : null}
            </div>
          ))}
        </div>
        <div className="visas-mega__footer">
          <Link href="/#popular-routes" className="visas-mega__home-popular-link">
            View popular pathway tiles on the homepage →
          </Link>
          <p className="visas-mega__footer-proof">Trusted flow: quiz → strategy → consultation-ready submission</p>
          {intentShortcuts.length ? (
            <div className="visas-mega__intent-shortcuts">
              {intentShortcuts.map((shortcut) => (
                <Link
                  key={shortcut.id}
                  href={shortcut.href}
                  className="visas-mega__intent-chip"
                >
                  {shortcut.label}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="visas-mega__actions">
            <Link href="/assessment" className="visas-mega__footer-cta">
              Start free assessment
            </Link>
            <Link href="/book-consultation" className="visas-mega__footer-cta visas-mega__footer-cta--ghost">
              Book consultation
            </Link>
          </div>
          <p className="visas-mega__disclaimer">
            Smart tools are advisory only and do not replace official eligibility decisions.
          </p>
        </div>
      </div>
    </details>
  );
}
