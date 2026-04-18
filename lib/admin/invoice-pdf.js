import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import { buildInvoicePaymentQrPng } from "./invoice-payment-qr";
import { MINROSH_ISSUER_DEFAULT } from "./invoice-defaults";

/**
 * Shared invoice PDF builder for download + email attachment flows.
 * @param {object} inv
 * @param {object} fallbackBank
 * @returns {Promise<Buffer>}
 */
export async function buildInvoicePdfBuffer(inv, fallbackBank = {}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const rawLogoPath = String(inv?.issuer?.logoPath || "/images/minrosh-logo.png");
  const relLogoPath = rawLogoPath.startsWith("/") ? rawLogoPath.slice(1) : rawLogoPath;
  const logoPath = path.join(process.cwd(), "public", relLogoPath);

  const left = 44;
  const right = 551;
  const money = (value) => `${inv.currency || "AUD"} ${Number(value || 0).toFixed(2)}`;
  const fitText = (text, maxWidth, targetSize = 10, minSize = 7, useBold = false) => {
    const value = String(text || "");
    const activeFont = useBold ? fontBold : font;
    let size = targetSize;
    while (size > minSize && activeFont.widthOfTextAtSize(value, size) > maxWidth) size -= 0.5;
    if (activeFont.widthOfTextAtSize(value, size) <= maxWidth) return { text: value, size };
    let trimmed = value;
    while (trimmed.length > 1 && activeFont.widthOfTextAtSize(`${trimmed}\u2026`, size) > maxWidth) trimmed = trimmed.slice(0, -1);
    return { text: `${trimmed}\u2026`, size };
  };
  const drawWrapped = ({ text, x, y, maxWidth, size = 9, lineGap = 3, useBold = false, color = rgb(0.1, 0.1, 0.12), maxLines = 2 }) => {
    const activeFont = useBold ? fontBold : font;
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;
      if (activeFont.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
      else {
        if (current) lines.push(current);
        current = w;
      }
      if (lines.length >= maxLines) break;
    }
    if (current && lines.length < maxLines) lines.push(current);
    if (lines.length === maxLines) lines[maxLines - 1] = fitText(lines[maxLines - 1], maxWidth, size, Math.max(6, size - 1), useBold).text;
    let yy = y;
    for (const line of lines) {
      page.drawText(line, { x, y: yy, size, font: activeFont, color });
      yy -= size + lineGap;
    }
    return yy;
  };
  const issuer = { ...MINROSH_ISSUER_DEFAULT, ...(inv.issuer || {}) };
  const titleSize = Math.max(14, Math.min(32, Number(issuer.titleFontSize || 22)));
  const bodySize = Math.max(8, Math.min(14, Number(issuer.bodyFontSize || 10)));
  const bank = inv.paymentInstructions || fallbackBank || {};
  const terms = [
    "1. Professional fees do not include Department of Home Affairs charges unless stated.",
    "2. Payment is due within 14 days of the invoice date.",
    "3. Professional fees are generally non-refundable once work has commenced.",
  ];
  if (inv.terms) terms[0] = String(inv.terms).slice(0, 200);

  const amountDue = Math.max(0, Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0));
  const paymentRef = `${bank.paymentReferencePrefix || "INV"}-${inv.invoiceNumber}`;

  // Header hierarchy (logo/identity left, invoice meta right)
  page.drawText("TAX INVOICE", { x: 404, y: 808, size: Math.max(22, titleSize + 2), font, color: rgb(0.2, 0.23, 0.3) });
  page.drawText(`Invoice #: INV-${inv.invoiceNumber}`, { x: 404, y: 787, size: 11, font: fontBold, color: rgb(0.28, 0.31, 0.36) });
  page.drawText(`Date: ${inv.date}`, { x: 404, y: 771, size: 11, font, color: rgb(0.38, 0.4, 0.45) });

  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      let logo = null;
      try {
        logo = await pdfDoc.embedPng(logoBytes);
      } catch {
        logo = await pdfDoc.embedJpg(logoBytes);
      }
      page.drawImage(logo, { x: left, y: 768, width: 72, height: 72 });
    } catch {
      page.drawText("Logo unavailable", { x: left, y: 796, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    }
  } else {
    page.drawText("Logo unavailable", { x: left, y: 796, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  }
  const headerName = fitText(issuer.businessName, 272, bodySize, 8.5, true);
  page.drawText(headerName.text, { x: left + 82, y: 808, size: headerName.size, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText(`ABN: ${issuer.abn} | ACN: ${issuer.acn}`, { x: left + 82, y: 792, size: 9, font, color: rgb(0.38, 0.4, 0.45) });
  drawWrapped({ text: issuer.address, x: left + 82, y: 777, maxWidth: 272, size: 9, lineGap: 2, color: rgb(0.38, 0.4, 0.45), maxLines: 2 });

  // Summary ribbon (amount due + due date)
  page.drawRectangle({ x: left, y: 705, width: right - left, height: 52, color: rgb(0.972, 0.98, 0.988) });
  page.drawLine({ start: { x: left, y: 705 }, end: { x: right, y: 705 }, thickness: 0.6, color: rgb(0.86, 0.88, 0.91) });
  page.drawLine({ start: { x: left, y: 757 }, end: { x: right, y: 757 }, thickness: 0.6, color: rgb(0.86, 0.88, 0.91) });
  page.drawText("AMOUNT DUE", { x: left + 10, y: 741, size: 8.5, font: fontBold, color: rgb(0.45, 0.47, 0.53) });
  page.drawText(money(amountDue), { x: left + 10, y: 717, size: 20, font: fontBold, color: rgb(0.1, 0.12, 0.15) });
  page.drawText("DUE DATE", { x: right - 118, y: 741, size: 8.5, font: fontBold, color: rgb(0.45, 0.47, 0.53) });
  page.drawText(String(inv.dueDate || inv.date), { x: right - 118, y: 719, size: 13, font: fontBold, color: rgb(0.78, 0.15, 0.12) });

  // Bill-to details
  let y = 686;
  page.drawText("Bill to", { x: left, y, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  y -= 15;
  page.drawText(`Client Name: ${inv.customerName || "-"}`, { x: left, y, size: 9, font, color: rgb(0.16, 0.16, 0.2) });
  y -= 13;
  if (inv.customerContact || inv.customerEmail) {
    page.drawText(`Client Contact: ${inv.customerContact || inv.customerEmail}`, { x: left, y, size: 9, font, color: rgb(0.16, 0.16, 0.2) });
    y -= 13;
  }
  if (inv.customerAddress) {
    page.drawText(`Client Address: ${String(inv.customerAddress).slice(0, 120)}`, { x: left, y, size: 9, font, color: rgb(0.16, 0.16, 0.2) });
    y -= 13;
  }

  // Service table (clean horizontal-line style)
  y -= 6;
  const tableTop = y;
  const col = { desc: left + 8, qty: left + 302, unit: left + 356, gst: left + 428, total: left + 492 };
  page.drawRectangle({ x: left, y: tableTop - 16, width: right - left, height: 18, color: rgb(0.972, 0.98, 0.988) });
  page.drawLine({ start: { x: left, y: tableTop - 16 }, end: { x: right, y: tableTop - 16 }, thickness: 1, color: rgb(0.24, 0.25, 0.3) });
  page.drawText("Description", { x: col.desc, y: tableTop - 10, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText("Qty", { x: col.qty, y: tableTop - 10, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText("Unit Price", { x: col.unit, y: tableTop - 10, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText("GST", { x: col.gst, y: tableTop - 8, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText("Amount AUD", { x: col.total - 10, y: tableTop - 8, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  y = tableTop - 24;
  for (const item of (Array.isArray(inv.lineItems) ? inv.lineItems : []).slice(0, 14)) {
    page.drawLine({ start: { x: left, y: y - 3 }, end: { x: right, y: y - 3 }, thickness: 0.4, color: rgb(0.9, 0.9, 0.92) });
    const desc = fitText(String(item.description || "-"), 286, 8, 7, false);
    page.drawText(desc.text, { x: col.desc, y: y + 2, size: desc.size, font, color: rgb(0.1, 0.1, 0.12) });
    page.drawText(Number(item.quantity || 1).toFixed(2), { x: col.qty, y: y + 2, size: 8, font, color: rgb(0.1, 0.1, 0.12) });
    page.drawText(Number(item.unitPrice || 0).toFixed(2), { x: col.unit, y: y + 2, size: 8, font, color: rgb(0.1, 0.1, 0.12) });
    page.drawText(Number(item.taxAmount || 0).toFixed(2), { x: col.gst, y: y + 2, size: 8, font, color: rgb(0.1, 0.1, 0.12) });
    page.drawText(Number(item.amount || 0).toFixed(2), { x: col.total, y: y + 2, size: 8, font, color: rgb(0.1, 0.1, 0.12) });
    y -= 17;
  }

  y -= 8;
  const discount = Number(inv.discount || 0);
  const paymentBlockY = y - 142;
  page.drawRectangle({ x: left, y: paymentBlockY, width: 292, height: 126, color: rgb(0.972, 0.98, 0.988) });
  page.drawText("HOW TO PAY", { x: left + 10, y: paymentBlockY + 108, size: 8, font: fontBold, color: rgb(0.38, 0.4, 0.45) });
  page.drawText(`Bank: ${bank.bankName || "Commonwealth Bank (CBA)"}`, { x: left + 10, y: paymentBlockY + 92, size: 8.5, font, color: rgb(0.1, 0.1, 0.12) });
  const nextY = drawWrapped({
    text: `Account Name: ${bank.accountName || issuer.businessName}`,
    x: left + 10,
    y: paymentBlockY + 78,
    maxWidth: 145,
    size: 8.2,
    lineGap: 1,
    color: rgb(0.1, 0.1, 0.12),
    maxLines: 2,
  });
  page.drawText(`BSB: ${bank.bsb || "064-087"}`, { x: left + 10, y: nextY - 1, size: 8.5, fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText(`Account Number: ${bank.accountNumber || bank.accountNumberMasked || "10335779"}`, { x: left + 10, y: nextY - 15, size: 8.5, fontBold, color: rgb(0.1, 0.1, 0.12) });
  page.drawText(`Reference: ${paymentRef}`, { x: left + 10, y: nextY - 30, size: 8.5, fontBold, color: rgb(0.1, 0.1, 0.12) });

  // Totals panel (right side)
  const totalsX = right - 170;
  const totalsY = paymentBlockY + 106;
  page.drawText("Subtotal", { x: totalsX, y: totalsY, size: 9, font, color: rgb(0.15, 0.16, 0.2) });
  page.drawText(money(inv.subtotal), { x: right - 8 - font.widthOfTextAtSize(money(inv.subtotal), 9), y: totalsY, size: 9, font, color: rgb(0.15, 0.16, 0.2) });
  page.drawText("GST 10%", { x: totalsX, y: totalsY - 15, size: 9, font, color: rgb(0.15, 0.16, 0.2) });
  page.drawText(money(inv.taxTotal), { x: right - 8 - font.widthOfTextAtSize(money(inv.taxTotal), 9), y: totalsY - 15, size: 9, font, color: rgb(0.15, 0.16, 0.2) });
  page.drawText("Discount", { x: totalsX, y: totalsY - 30, size: 9, font, color: rgb(0.15, 0.16, 0.2) });
  page.drawText(money(-discount), { x: right - 8 - font.widthOfTextAtSize(money(-discount), 9), y: totalsY - 30, size: 9, font, color: rgb(0.15, 0.16, 0.2) });
  page.drawLine({ start: { x: totalsX, y: totalsY - 38 }, end: { x: right - 8, y: totalsY - 38 }, thickness: 0.5, color: rgb(0.86, 0.88, 0.91) });
  page.drawText("Total", { x: totalsX, y: totalsY - 54, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  const totalPayable = money(inv.total || inv.amount);
  page.drawText(totalPayable, { x: right - 8 - fontBold.widthOfTextAtSize(totalPayable, 12), y: totalsY - 54, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  const outstanding = money(Math.max(0, Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0)));
  page.drawText(`Outstanding: ${outstanding}`, { x: totalsX, y: totalsY - 72, size: 8.5, font: fontBold, color: rgb(0.32, 0.34, 0.38) });

  // Optional payment QR
  const qrPng = await buildInvoicePaymentQrPng({
    amount: amountDue,
    reference: paymentRef,
    mode: bank.qrMode,
  });
  if (qrPng) {
    try {
      const qr = await pdfDoc.embedPng(qrPng);
      const qrSize = 74;
      const qrX = left + 206;
      const qrY = paymentBlockY + 42;
      page.drawRectangle({
        x: qrX - 8,
        y: qrY - 8,
        width: qrSize + 16,
        height: qrSize + 16,
        color: rgb(1, 1, 1),
      });
      page.drawImage(qr, { x: qrX, y: qrY, width: qrSize, height: qrSize });
      page.drawText("Scan to pay", {
        x: qrX + 8,
        y: qrY - 12,
        size: 7,
        font,
        color: rgb(0.35, 0.35, 0.4),
      });
    } catch {
      // keep PDF generation resilient on invalid QR buffer
    }
  }

  // Terms/footer
  let termsY = paymentBlockY - 18;
  page.drawText("Terms and conditions", { x: left, y: termsY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
  termsY -= 12;
  for (const t of terms) {
    page.drawText(String(t), { x: left, y: termsY, size: 7.5, font, color: rgb(0.36, 0.38, 0.43) });
    termsY -= 11;
  }
  if (inv.discountDescription) {
    drawWrapped({
      text: `Discount note: ${String(inv.discountDescription)}`,
      x: left,
      y: termsY - 1,
      maxWidth: right - left,
      size: 7.5,
      lineGap: 1,
      color: rgb(0.42, 0.44, 0.48),
      maxLines: 2,
    });
  }
  page.drawText("Generated from the Minrosh admin panel.", { x: left, y: 36, size: 7, font, color: rgb(0.45, 0.45, 0.5) });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
