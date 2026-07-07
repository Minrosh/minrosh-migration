import {
  PREMIUM_PAGE_CONTENT_CLASS,
  PREMIUM_PAGE_INNER_CLASS,
  PREMIUM_PAGE_SHELL_CLASS,
} from "@/lib/premium-page-classes";

/**
 * Cream background + content rail wrapper for public marketing pages.
 * @param {{ children: import("react").ReactNode, className?: string, contentClassName?: string, id?: string }} props
 */
export function PremiumPageShell({ children, className = "", contentClassName = "", id }) {
  return (
    <div id={id} className={`${PREMIUM_PAGE_SHELL_CLASS} ${className}`.trim()}>
      <div className={PREMIUM_PAGE_INNER_CLASS}>
        <div className={`${PREMIUM_PAGE_CONTENT_CLASS} ${contentClassName}`.trim()}>{children}</div>
      </div>
    </div>
  );
}
