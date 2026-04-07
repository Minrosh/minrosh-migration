/**
 * Default WhatsApp lead-in for organic traffic (e.g. Sri Lanka skilled enquiries).
 */
export const WHATSAPP_LEAD_MESSAGE =
  "Hi MinRosh, I am a professional from Sri Lanka looking to assess my PR points.";

export function buildWhatsAppUrl(digits, message = WHATSAPP_LEAD_MESSAGE) {
  const n = String(digits ?? "").replace(/\D/g, "");
  if (!n) return "https://wa.me/";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
