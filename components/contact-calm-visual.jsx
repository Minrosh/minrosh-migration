import Image from "next/image";

/** Brisbane river photograph for the booking column. Replaces the empty decorative panel. */
export function ContactCalmVisual() {
  return (
    <figure className="relative m-0 h-52 overflow-hidden rounded-2xl border border-brand-plum/10">
      <Image
        src="/images/hero-brisbane-river-cbd-hd.jpg"
        alt="Brisbane River and CBD skyline"
        fill
        className="object-cover object-[center_42%]"
        sizes="(max-width: 1024px) 100vw, 640px"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f1020]/85 to-transparent px-4 pb-3 pt-8 text-sm font-semibold text-white">
        Brisbane-based information and education support
      </figcaption>
    </figure>
  );
}
