"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Thumb-zone destinations; labels kept short for narrow viewports. */
const TABS = [
  {
    href: "/",
    label: "Home",
    aria: "Home",
    isActive: (p) => p === "/",
  },
  {
    href: "/assessment",
    label: "Check",
    aria: "Pathway questionnaire",
    isActive: (p) => p === "/assessment" || p.startsWith("/assessment/"),
  },
  {
    href: "/book-consultation",
    label: "Book",
    aria: "Book consultation",
    isActive: (p) => p === "/book-consultation" || p.startsWith("/book-consultation/"),
  },
  {
    href: "/contact",
    label: "Contact",
    aria: "Contact",
    isActive: (p) => p === "/contact" || p.startsWith("/contact/"),
  },
  {
    href: "/australian-visas-official-sources",
    label: "Visas",
    aria: "Australian visas and official sources",
    isActive: (p) =>
      p === "/australian-visas-official-sources" || p.startsWith("/australian-visas-official-sources/"),
  },
];

function IconHome({ active }) {
  const stroke = active ? "var(--brand-gold, #caa64d)" : "var(--brand-plum, #3d2432)";
  return (
    <svg className="size-[22px] shrink-0 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck({ active }) {
  const stroke = active ? "var(--brand-gold, #caa64d)" : "var(--brand-plum, #3d2432)";
  return (
    <svg className="size-[22px] shrink-0 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 11l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBook({ active }) {
  const stroke = active ? "var(--brand-gold, #caa64d)" : "var(--brand-plum, #3d2432)";
  return (
    <svg className="size-[22px] shrink-0 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h11v14a2 2 0 01-2 2H8V6zM8 6H5a2 2 0 00-2 2v12a2 2 0 002 2h3"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail({ active }) {
  const stroke = active ? "var(--brand-gold, #caa64d)" : "var(--brand-plum, #3d2432)";
  return (
    <svg className="size-[22px] shrink-0 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0l8 7 8-7"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVisas({ active }) {
  const stroke = active ? "var(--brand-gold, #caa64d)" : "var(--brand-plum, #3d2432)";
  return (
    <svg className="size-[22px] shrink-0 motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12h6M9 8h6m-7 8h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = [IconHome, IconCheck, IconBook, IconMail, IconVisas];

/**
 * Fixed bottom tab navigation for marketing shell viewports &lt;= 920px (aligned with header nav breakpoint).
 */
export function SiteMobileTabBar() {
  const pathname = usePathname() || "";

  return (
    <nav
      className="site-mobile-tab-bar hidden max-[920px]:flex"
      aria-label="Primary mobile navigation"
      data-component="site-mobile-tab-bar"
    >
      <div className="site-mobile-tab-bar__inner">
        {TABS.map((tab, index) => {
          const active = tab.isActive(pathname);
          const Icon = ICONS[index] ?? IconHome;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              scroll
              className={`site-mobile-tab-bar__link touch-manipulation motion-safe:transition-colors motion-safe:duration-200 ${
                active ? "site-mobile-tab-bar__link--active" : "text-brand-plum/80"
              }`}
              aria-current={active ? "page" : undefined}
              aria-label={tab.aria}
            >
              <Icon active={active} />
              <span className="site-mobile-tab-bar__label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
