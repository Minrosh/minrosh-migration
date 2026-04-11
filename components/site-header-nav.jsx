"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Primary navigation for marketing pages (SiteShell): hamburger + drawer on small
 * viewports, horizontal nav from 921px up.
 */
export function SiteHeaderNav({ navLinks, currentPath }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    document.body.dataset.menu = menuOpen ? "open" : "closed";
    return () => {
      document.body.dataset.menu = "closed";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const nav = navRef.current;
    const first =
      nav?.querySelector?.("a[href], button:not([disabled])") || null;
    window.requestAnimationFrame(() => {
      first?.focus?.();
    });
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuToggleRef.current?.focus?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuToggleRef.current?.focus?.();
  }

  return (
    <>
      <button
        ref={menuToggleRef}
        type="button"
        className="menu-toggle"
        aria-expanded={menuOpen ? "true" : "false"}
        aria-controls="site-header-primary-nav"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() =>
          setMenuOpen((open) => {
            const next = !open;
            if (!next) {
              window.requestAnimationFrame(() => menuToggleRef.current?.focus?.());
            }
            return next;
          })
        }
      >
        <span />
        <span />
      </button>
      {menuOpen ? (
        <button
          type="button"
          className="site-nav__backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}
      <nav
        ref={navRef}
        id="site-header-primary-nav"
        className={`site-nav ${menuOpen ? "is-open" : ""}`}
        aria-label="Primary"
      >
        <div className="site-nav__group site-nav__group--main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`site-nav__link ${currentPath === link.href ? "is-active" : ""}`}
              aria-current={currentPath === link.href ? "page" : undefined}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="site-nav__group site-nav__group--actions">
          <Link href="/book-consultation" className="btn btn-primary site-nav__cta" onClick={closeMenu}>
            Book Consultation
          </Link>
          <Link href="/assessment" className="btn btn-ghost site-nav__cta-secondary site-nav__cta" onClick={closeMenu}>
            Free assessment
          </Link>
          <Link href="/tools" className="btn btn-ghost site-nav__cta-secondary site-nav__cta" onClick={closeMenu}>
            Tools
          </Link>
        </div>
      </nav>
    </>
  );
}
