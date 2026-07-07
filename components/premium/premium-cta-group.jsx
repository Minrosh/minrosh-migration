/**
 * @param {{ children: import("react").ReactNode, className?: string, align?: "start" | "center" }} props
 */
export function PremiumCTAGroup({ children, className = "", align = "start" }) {
  const alignClass = align === "center" ? "justify-center" : "justify-start";
  return (
    <div
      className={`premium-cta-group mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-3 ${alignClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
