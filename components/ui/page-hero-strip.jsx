"use client";

import Image from "next/image";
import { HERO_BRISBANE_BLUR_DATA_URL } from "@/lib/marketing/hero-brisbane-blur";

export function PageHeroStrip({
  title,
  subtitle = "",
  eyebrow,
  bgImage = "/images/brisbane-aerial.png",
  bgAlt = "Brisbane CBD and Brisbane River aerial view",
  className = "",
  overlayClassName = "",
  contentClassName = "",
  blurDataURL = "",
}) {
  const resolvedBlurDataURL = blurDataURL || (bgImage === "/images/hero-brisbane-river-cbd-hd.jpg" ? HERO_BRISBANE_BLUR_DATA_URL : "");
  return (
    <section
      className={`guide-page-hero-strip relative flex w-full items-center overflow-hidden ${className}`.trim()}
    >
      <Image
        src={bgImage}
        alt={bgAlt}
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, 1600px"
        className="object-cover object-[center_42%]"
        placeholder={resolvedBlurDataURL ? "blur" : "empty"}
        {...(resolvedBlurDataURL ? { blurDataURL: resolvedBlurDataURL } : {})}
      />
      <div className={`page-hero-strip__fog absolute inset-0 ${overlayClassName}`.trim()} aria-hidden />
      <div className={`relative z-10 mx-auto w-full max-w-[var(--content-max)] px-[var(--content-pad)] py-10 text-left text-[#1f1020] ${contentClassName}`.trim()}>
        {eyebrow ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#881337]">{eyebrow}</p>
        ) : null}
        <h1 className="max-w-3xl text-balance font-serif text-[clamp(1.875rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-tight text-[#1f1020]">{title}</h1>
        {subtitle ? <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#1f1020]/80 sm:text-base">{subtitle}</p> : null}
      </div>
    </section>
  );
}
