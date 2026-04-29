import Link from "next/link";

/** @param {string | undefined} p */
export function normalizePathname(p) {
  if (!p) return "";
  let s = String(p).trim().split("#")[0];
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

/**
 * Accessible breadcrumb trail: last segment is plain text when it matches `currentPath` or `current: true`.
 * @param {{ items: Array<{ label: string; href?: string; current?: boolean }>; currentPath?: string }} props
 */
export function BreadcrumbsNav({ items, currentPath = "" }) {
  if (!items?.length) return null;
  const here = normalizePathname(currentPath);

  return (
    <nav className="breadcrumbs mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = item.href ? String(item.href).trim() : "";
          const pathMatch = Boolean(here && href && normalizePathname(href) === here);
          const asCurrent = Boolean(item.current) || (isLast && pathMatch) || (isLast && !href);
          const key = `${index}-${item.label}-${href || "here"}`;

          return (
            <li key={key} className="breadcrumbs__item">
              {index > 0 ? (
                <span className="breadcrumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
              {asCurrent ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : href ? (
                <Link href={href}>{item.label}</Link>
              ) : (
                <span className="breadcrumbs__current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
