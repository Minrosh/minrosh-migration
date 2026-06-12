document.documentElement.classList.remove("dark");
try {
  localStorage.setItem("theme", "light");
} catch (_e) {
  // Ignore storage failures (private mode, blocked storage).
}
