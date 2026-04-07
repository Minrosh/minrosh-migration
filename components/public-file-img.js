/* eslint-disable @next/next/no-img-element -- Static files from /public; plain img avoids next/image + SVG edge cases in production. */

/**
 * Renders a normal <img> for paths under /public (e.g. /images/...).
 * Use this instead of next/image for local SVGs/JPEGs so the browser loads the URL directly.
 */
export function PublicFileImg({ src, alt = "", width, height, className, priority }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      {...(priority ? { fetchPriority: "high" } : {})}
      decoding="async"
    />
  );
}
