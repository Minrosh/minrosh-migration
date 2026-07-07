import { PREMIUM_HERO_CARD_CLASS } from "@/lib/premium-page-classes";

/**
 * @param {{
 *   eyebrow?: string;
 *   title: import("react").ReactNode;
 *   lead?: import("react").ReactNode;
 *   children?: import("react").ReactNode;
 *   className?: string;
 *   as?: keyof JSX.IntrinsicElements;
 * }} props
 */
export function PremiumPageHero({
  eyebrow,
  title,
  lead,
  children,
  className = "",
  as: Tag = "section",
}) {
  return (
    <Tag className={`premium-page-hero ${PREMIUM_HERO_CARD_CLASS} ${className}`.trim()}>
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h1 className="mt-2 text-balance font-black tracking-tight text-brand-plum [font-family:var(--font-display),Georgia,serif] text-3xl sm:text-4xl md:text-[2.35rem] md:leading-[1.12]">
        {title}
      </h1>
      {lead ? (
        <p className="premium-page-hero__lead mt-4 max-w-3xl text-base font-medium leading-relaxed text-brand-plum/75 sm:text-lg">
          {lead}
        </p>
      ) : null}
      {children}
    </Tag>
  );
}
