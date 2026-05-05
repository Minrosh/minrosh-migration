import fs from "node:fs";
import path from "node:path";

/**
 * PDF attached to auto-replies (contact thank-you, newsletter welcome).
 * Override with BROCHURE_FILE for custom assets.
 */
export function getBrochureFilePath() {
  const fromEnv = String(process.env.BROCHURE_FILE || "").trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.join(process.cwd(), fromEnv);
  }
  const emailPdf = path.join(process.cwd(), "public", "assets", "minrosh-email-brochure.pdf");
  const servicesPdf = path.join(process.cwd(), "public", "assets", "minrosh-services-brochure.pdf");
  if (fs.existsSync(emailPdf)) return emailPdf;
  if (fs.existsSync(servicesPdf)) return servicesPdf;
  return emailPdf;
}

export function getBrochureAttachments() {
  const filePath = getBrochureFilePath();
  if (!fs.existsSync(filePath)) return [];
  return [
    {
      filename: "MinRosh-Migration-Brochure.pdf",
      path: filePath,
      contentType: "application/pdf",
    },
  ];
}
