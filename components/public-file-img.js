import Image from "next/image";

const RASTER_EXT = /\.(avif|gif|jpe?g|png|webp)(\?|$)/i;

function isSvgSrc(src) {
  return /\.svg(\?|$)/i.test(String(src || ""));
}

/**
 * Optimized local images from /public via next/image (AVIF/WebP, lazy load, sizing).
 * Plain <img> is kept for SVG assets where the Next image pipeline adds little benefit.
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
  if (isSvgSrc(src) || !RASTER_EXT.test(String(src || ""))) {
    const resolvedFetchPriority = fetchPriority || (priority ? "high" : "auto");
    const resolvedDecoding = decoding || (priority ? "sync" : "async");
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG / uncommon static formats
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

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      {...(fetchPriority ? { fetchPriority } : {})}
    />
  );
}
