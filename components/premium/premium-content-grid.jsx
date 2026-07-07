/**
 * Two-column premium layout (stacks on mobile).
 * @param {{
 *   children: import("react").ReactNode;
 *   className?: string;
 *   asideClassName?: string;
 *   mainClassName?: string;
 *   reverseOnMobile?: boolean;
 * }} props
 */
export function PremiumContentGrid({
  children,
  className = "",
  asideClassName = "",
  mainClassName = "",
  reverseOnMobile = false,
}) {
  const childArray = Array.isArray(children) ? children : [children];
  const [main, aside] = childArray;
  const orderMain = reverseOnMobile ? "order-2 lg:order-1" : "order-1";
  const orderAside = reverseOnMobile ? "order-1 lg:order-2" : "order-2";

  return (
    <div
      className={`premium-content-grid grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start ${className}`.trim()}
    >
      <div className={`min-w-0 ${orderMain} ${mainClassName}`.trim()}>{main}</div>
      {aside ? <div className={`min-w-0 ${orderAside} ${asideClassName}`.trim()}>{aside}</div> : null}
    </div>
  );
}
