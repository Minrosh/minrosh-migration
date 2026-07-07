/** Shared premium public-page surface classes (homepage design language). */

export const PREMIUM_PAGE_SHELL_CLASS =
  "premium-public-page conversion-premium-phase1 bg-[var(--brand-cream)] pb-14 md:pb-16 min-w-0 overflow-x-clip";

export const PREMIUM_PAGE_INNER_CLASS =
  "w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)] min-w-0";

export const PREMIUM_PAGE_CONTENT_CLASS = "content-page premium-public-page__content min-w-0";

export const PREMIUM_GLASS_CARD_CLASS =
  "premium-glass-card glass-card rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.75)] shadow-[0_12px_40px_rgba(74,24,48,0.06)] backdrop-blur-[20px] min-w-0";

export const PREMIUM_HERO_CARD_CLASS = `${PREMIUM_GLASS_CARD_CLASS} p-6 md:p-8 lg:p-10`;

export const PREMIUM_BADGE_CLASS =
  "inline-flex items-center rounded-full border border-brand-plum/15 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-brand-plum/75";
