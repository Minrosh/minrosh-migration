/**
 * @param {{ eyebrow?: string; title: import("react").ReactNode; description?: import("react").ReactNode; className?: string }} props
 */
export function PremiumSectionHeader({ eyebrow, title, description, className = "" }) {
  return (
    <header className={`premium-section-header ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-rose">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-xl font-bold tracking-tight text-brand-plum [font-family:var(--font-display),Georgia,serif] sm:text-2xl">
        {title}
      </h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-plum/72 sm:text-base">{description}</p> : null}
    </header>
  );
}
