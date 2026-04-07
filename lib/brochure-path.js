import fs from "node:fs";
import path from "node:path";

/**
 * PDF attached to auto-replies (contact thank-you, newsletter welcome).
 * Override with BROCHURE_FILE for custom assets.
 */
export function getBrochureFilePath() {
  return (
    process.env.BROCHURE_FILE ||
    path.join(process.cwd(), "public", "assets", "minrosh-email-brochure.pdf")
  );
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
