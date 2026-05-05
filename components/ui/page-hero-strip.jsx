"use client";

import Image from "next/image";

export function PageHeroStrip({
  title,
  subtitle = "",
  eyebrow,
  bgImage = "/images/brisbane-aerial.png",
  bgAlt = "Brisbane CBD and Brisbane River aerial view",
  className = "",
  overlayClassName = "",
  contentClassName = "",
}) {
  return (
    <section
      className={`relative left-1/2 flex h-[350px] w-screen -translate-x-1/2 items-center justify-center overflow-hidden ${className}`.trim()}
    >
      <Image src={bgImage} alt={bgAlt} fill priority sizes="100vw" className="object-cover" />
      <div className={`absolute inset-0 bg-brand-plum/75 ${overlayClassName}`.trim()} aria-hidden />
      <div className={`relative z-10 mx-auto max-w-7xl px-6 text-center text-white ${contentClassName}`.trim()}>
        {eyebrow ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{eyebrow}</p>
        ) : null}
        <h1 className="text-balance font-serif text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle ? <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">{subtitle}</p> : null}
      </div>
    </section>
  );
}
