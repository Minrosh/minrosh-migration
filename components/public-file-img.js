/* eslint-disable @next/next/no-img-element -- Static files from /public; plain img avoids next/image + SVG edge cases in production. */

/**
 * Renders a normal <img> for paths under /public (e.g. /images/...).
 * Use this instead of next/image for local SVGs/JPEGs so the browser loads the URL directly.
 */
export function PublicFileImg({
  src,
  alt = "",
  width,
  height,
  className,
  priority = false,
  sizes,
  fetchPriority,
  decoding,
}) {
  const resolvedFetchPriority = fetchPriority || (priority ? "high" : "auto");
  const resolvedDecoding = decoding || (priority ? "sync" : "async");
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={resolvedFetchPriority}
      decoding={resolvedDecoding}
      {...(sizes ? { sizes } : {})}
    />
  );
}
