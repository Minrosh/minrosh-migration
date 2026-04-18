"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { filterSiteSearch } from "../lib/site-search-index";

/**
 * Desktop-first site search with lightweight typeahead (min-width 921px via CSS).
 */
export function SiteNavSearch() {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = open ? filterSiteSearch(query, { limit: 10 }) : [];

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    function onDocMouseDown(event) {
      if (!wrapRef.current?.contains(event.target)) close();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [close]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented) return;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      if (typeof window.matchMedia === "function" && !window.matchMedia("(min-width: 921px)").matches) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleInputChange(event) {
    const value = event.target.value;
    setQuery(value);
    setOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      window.location.assign(results[activeIndex].href);
    }
  }

  return (
    <div ref={wrapRef} className="site-nav-search">
      <label className="site-nav-search__label" htmlFor={`${id}-input`}>
        <span className="sr-only">Search site pages</span>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck="false"
          className="site-nav-search__input"
          placeholder="Jump to page (e.g. 189, partner)…"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open && results.length > 0 ? "true" : "false"}
          aria-controls={listId}
          aria-autocomplete="list"
        />
      </label>
      {open && results.length ? (
        <ul id={listId} className="site-nav-search__results" role="listbox">
          {results.map((item, index) => (
            <li key={item.href} role="presentation">
              <Link
                href={item.href}
                className={`site-nav-search__result${index === activeIndex ? " is-active" : ""}`}
                role="option"
                aria-selected={index === activeIndex ? "true" : "false"}
                onClick={close}
              >
                <span className="site-nav-search__result-label">{item.label}</span>
                <span className="site-nav-search__result-path">{item.href}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="site-nav-search__kbd-hint" aria-hidden="true">
        /
      </span>
    </div>
  );
}
