import { DEFAULT_COMPLIANCE } from "@/lib/compliance";

/**
 * Neutral banner for Australian visa-category / information pages.
 * @param {{ text?: string, className?: string, variant?: "banner" | "footer" }} props
 */
export function GeneralInformationBanner({ text, className = "", variant = "banner" }) {
  const body =
    String(text || "").trim() ||
    (variant === "footer"
      ? DEFAULT_COMPLIANCE.categoryPageFooter
      : DEFAULT_COMPLIANCE.categoryPageBanner);

  if (variant === "footer") {
    return (
      <p
        className={`general-information-footer mt-10 max-w-3xl text-sm leading-relaxed text-brand-plum/70 ${className}`.trim()}
        role="note"
      >
        {body}
      </p>
    );
  }

  return (
    <aside
      className={`general-information-banner rounded-2xl border border-brand-plum/10 bg-brand-cream/80 px-4 py-3 text-sm leading-relaxed text-brand-plum/85 shadow-sm ${className}`.trim()}
      role="note"
      aria-label="General information notice"
    >
      {body}
    </aside>
  );
}
