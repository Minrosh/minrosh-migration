"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "minrosh_accessibility_preferences_v1";

const DEFAULTS = {
  fontScale: "medium",
  contrast: "normal",
  theme: "light",
};

function applyPrefs(prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-font-scale", prefs.fontScale || "medium");
  root.setAttribute("data-contrast", prefs.contrast || "normal");
  root.setAttribute("data-theme", prefs.theme || "light");
}

export function AccessibilityPreferences() {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        applyPrefs(DEFAULTS);
        return;
      }
      const parsed = JSON.parse(raw);
      const next = {
        fontScale: ["small", "medium", "large"].includes(parsed?.fontScale) ? parsed.fontScale : "medium",
        contrast: ["normal", "high"].includes(parsed?.contrast) ? parsed.contrast : "normal",
        theme: ["light", "dark"].includes(parsed?.theme) ? parsed.theme : "light",
      };
      setPrefs(next);
      applyPrefs(next);
    } catch {
      applyPrefs(DEFAULTS);
    }
  }, []);

  function update(nextPatch) {
    const next = { ...prefs, ...nextPatch };
    setPrefs(next);
    applyPrefs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore local storage failures in restricted browsers.
    }
  }

  return (
    <div className="accessibility-preferences" aria-label="Accessibility preferences">
      <button
        type="button"
        className="site-header__icon-btn"
        aria-label={`Font size ${prefs.fontScale}; change font size`}
        onClick={() =>
          update({
            fontScale: prefs.fontScale === "small" ? "medium" : prefs.fontScale === "medium" ? "large" : "small",
          })
        }
      >
        A
      </button>
      <button
        type="button"
        className="site-header__icon-btn"
        aria-label={`Contrast mode ${prefs.contrast}; toggle high contrast`}
        onClick={() => update({ contrast: prefs.contrast === "high" ? "normal" : "high" })}
      >
        ◐
      </button>
      <button
        type="button"
        className="site-header__icon-btn"
        aria-label={`Theme ${prefs.theme}; toggle dark mode`}
        onClick={() => update({ theme: prefs.theme === "dark" ? "light" : "dark" })}
      >
        ☾
      </button>
    </div>
  );
}
