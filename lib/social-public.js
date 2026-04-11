import { buildWhatsAppUrl, WHATSAPP_LEAD_MESSAGE } from "./whatsapp-prefill";

const ORDER = ["facebook", "instagram", "linkedin", "youtube", "x", "tiktok"];

const LABELS = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  "whatsapp-secondary": "WhatsApp (alternate)",
};

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

/**
 * Public social / messaging destinations for icons and schema.org sameAs.
 * @param {object} brand — site.json `brand`
 * @param {{ includeWhatsApp?: boolean }} [options]
 * @returns {{ id: string, href: string, label: string }[]}
 */
export function listPublicSocialIcons(brand, options = {}) {
  const includeWhatsApp = options.includeWhatsApp !== false;
  const items = [];
  const social = brand?.social && typeof brand.social === "object" ? brand.social : {};

  for (const key of ORDER) {
    const href = String(social[key] || "").trim();
    if (!href || !isHttpUrl(href)) continue;
    items.push({ id: key, href, label: LABELS[key] || key });
  }

  if (includeWhatsApp) {
    const wa = String(brand?.whatsapp || "").replace(/\D/g, "");
    if (wa) {
      items.push({
        id: "whatsapp",
        href: buildWhatsAppUrl(wa, WHATSAPP_LEAD_MESSAGE),
        label: LABELS.whatsapp,
      });
    }
    const wa2 = String(brand?.whatsappSecondary || "").replace(/\D/g, "");
    if (wa2 && wa2 !== wa) {
      items.push({
        id: "whatsapp-secondary",
        href: buildWhatsAppUrl(wa2, WHATSAPP_LEAD_MESSAGE),
        label: LABELS["whatsapp-secondary"],
      });
    }
  }

  return items;
}

/** Deduplicated URLs for JSON-LD sameAs (order preserved). */
export function sameAsUrlsForSchema(brand) {
  const seen = new Set();
  const out = [];
  for (const { href } of listPublicSocialIcons(brand, { includeWhatsApp: true })) {
    if (seen.has(href)) continue;
    seen.add(href);
    out.push(href);
  }
  return out;
}
