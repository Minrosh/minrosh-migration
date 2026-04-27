import QRCode from "qrcode";

function getPayId() {
  return String(process.env.INVOICE_PAYID || process.env.SMTP_FROM || "info@minroshmigration.com.au").trim();
}

export function resolveInvoicePayId() {
  return getPayId();
}

export function resolveInvoiceQrMode(overrideMode) {
  const mode = String(overrideMode || process.env.INVOICE_QR_MODE || "plain_text")
    .trim()
    .toLowerCase();
  return mode === "npp_uri" ? "npp_uri" : "plain_text";
}

/**
 * Build AU NPP payment URI for invoice-level payment.
 * @param {{ amount: number, reference: string }} input
 */
export function buildAuNppPaymentUri({ amount, reference }) {
  const payId = encodeURIComponent(getPayId());
  const value = Number(amount || 0).toFixed(2);
  const ref = encodeURIComponent(String(reference || "").trim().slice(0, 80));
  return `au-npp://pay?id=${payId}&amount=${value}&ref=${ref}`;
}

export function buildInvoicePaymentText({ amount, reference }) {
  const value = Number(amount || 0).toFixed(2);
  const ref = String(reference || "").trim().slice(0, 80);
  return [`PayID: ${getPayId()}`, `Amount: ${value}`, `Reference: ${ref}`, "Use your banking app to pay."].join("\n");
}

/**
 * Generate PNG bytes for invoice payment QR.
 * @param {{ amount: number, reference: string }} input
 * @returns {Promise<Buffer | null>}
 */
export async function buildInvoicePaymentQrPng(input) {
  const amount = Number(input?.amount || 0);
  if (!(amount > 0)) return null;
  const reference = String(input?.reference || "").trim();
  if (!reference) return null;
  const payload =
    resolveInvoiceQrMode(input?.mode) === "npp_uri"
      ? buildAuNppPaymentUri({ amount, reference })
      : buildInvoicePaymentText({ amount, reference });
  try {
    const png = await QRCode.toBuffer(payload, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 1,
      width: 256,
      color: {
        dark: "#050A18",
        light: "#F8FAFC",
      },
    });
    return Buffer.from(png);
  } catch {
    return null;
  }
}
