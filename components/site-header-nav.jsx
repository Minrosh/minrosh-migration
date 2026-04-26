"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteVisasMegaMenu } from "./site-visas-mega-menu";
import { AccessibilityPreferences } from "./accessibility-preferences";

/** Collapsed into desktop mega menu when `enableVisaMega` is true. */
const VISA_HUB_PATHS = new Set(["/skilled-migration", "/partner-visa-australia", "/student-visa-australia"]);

/**
 * Primary navigation for marketing pages (SiteShell): hamburger + drawer on small
 * viewports, horizontal nav from 921px up.
 */
export function SiteHeaderNav({ navLinks, currentPath, enableVisaMega = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncHash = () => setCurrentHash(window.location.hash || "");
    syncHash();
  }, []);

  function closeMenu() {
    setMenuOpen(false);
    menuToggleRef.current?.focus?.();
  }

  function normalizeNavHref(href) {
    if (!href) return href;
    return href;
  }

  function isActiveNavHref(href) {
    if (href === "/") return currentPath === "/";
    return currentPath === href || currentPath.startsWith(`${href}/`);
  }

  function handleNavClick(event, href) {
    closeMenu();
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
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
          {navLinks.map((link) => {
            const normalizedHref = normalizeNavHref(link.href);
            const isActive = isActiveNavHref(normalizedHref);
            const isVisaHub = VISA_HUB_PATHS.has(normalizedHref);
            const collapseDesktop = enableVisaMega && isVisaHub;
            return (
              <Fragment key={link.href}>
                <Link
                  href={normalizedHref}
                  scroll
                  className={`site-nav__link site-nav__link--header ${
                    collapseDesktop ? "site-nav__link--visa-hub-collapsed-desktop " : ""
                  }${
                    isActive
                      ? "is-active bg-brand-rose/10 text-brand-rose"
                      : "text-brand-plum/80 hover:bg-brand-cream hover:text-brand-plum"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, normalizedHref)}
                >
                  {link.label}
                </Link>
                {enableVisaMega && normalizedHref === "/" ? (
                  <div className="site-nav__mega-host">
                    <SiteVisasMegaMenu />
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
        <div className="site-nav__toolbar">
          <div className="site-nav__cta-cluster">
            <AccessibilityPreferences />
            <Link
              href="/book-consultation"
              scroll
              className="btn btn-primary site-nav__cta site-nav__cta--primary"
              onClick={(event) => handleNavClick(event, "/book-consultation")}
            >
              Book consultation
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
