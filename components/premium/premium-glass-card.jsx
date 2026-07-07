import { PREMIUM_GLASS_CARD_CLASS } from "@/lib/premium-page-classes";

/**
 * @param {{ children: import("react").ReactNode, className?: string, as?: keyof JSX.IntrinsicElements, id?: string }} props
 */
export function PremiumGlassCard({ children, className = "", as: Tag = "div", id }) {
  return (
    <Tag id={id} className={`${PREMIUM_GLASS_CARD_CLASS} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
