/**
 * Shared Tailwind classes for primary CTAs on conversion routes (matches home hero CTA ring/spacing).
 * Requires `app/home.css` loaded for `.home-hero-premium__cta` gradient (see Phase 1 pages).
 */
export const CONVERSION_PREMIUM_PRIMARY_CTA_CLASS =
  "home-hero-premium__cta inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-center text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.28)] outline-none ring-offset-2 ring-offset-[var(--brand-cream)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.35)] focus-visible:ring-2 focus-visible:ring-[#881337]/45 touch-manipulation";
