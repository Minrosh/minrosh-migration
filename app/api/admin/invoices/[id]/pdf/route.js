import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { getInvoice, getBankDetails } from "@/lib/admin/invoices-service";

export async function GET(_request, { params }) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { id } = await params;
  const inv = getInvoice(id);
  if (!inv) return new Response("Not found", { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const line = (text, size = 11, bold = false) => {
    page.drawText(text, {
      x: left,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.12),
    });
    y -= size + 10;
  };

  line("MinRosh Migration — Invoice", 16, true);
  y -= 6;
  line(`Invoice #: ${inv.invoiceNumber}`);
  line(`Date: ${inv.date}`);
  line(`Due date: ${inv.dueDate || inv.date}`);
  line(`Customer: ${inv.customerName}`);
  if (inv.customerEmail) line(`Email: ${inv.customerEmail}`);
  line(`Status: ${inv.status}`);
  line(`Currency: ${inv.currency || "AUD"}`);
  y -= 12;
  line("Line items", 11, true);
  const lines = Array.isArray(inv.lineItems) ? inv.lineItems : [];
  for (const item of lines.slice(0, 20)) {
    const qty = Number(item.quantity || 1).toFixed(2);
    const unit = Number(item.unitPrice || 0).toFixed(2);
    const amount = Number(item.amount || 0).toFixed(2);
    line(`- ${item.description} (${qty} x ${unit}) = ${amount}`, 9);
  }
  y -= 6;
  line(`Subtotal: ${inv.currency || "AUD"} ${Number(inv.subtotal || 0).toFixed(2)}`);
  line(`Tax: ${inv.currency || "AUD"} ${Number(inv.taxTotal || 0).toFixed(2)}`);
  line(`Total: ${inv.currency || "AUD"} ${Number(inv.total || inv.amount || 0).toFixed(2)}`, 11, true);
  line(`Paid: ${inv.currency || "AUD"} ${Number(inv.paidAmount || 0).toFixed(2)}`);
  line(`Outstanding: ${inv.currency || "AUD"} ${Math.max(0, Number(inv.total || inv.amount || 0) - Number(inv.paidAmount || 0)).toFixed(2)}`);
  y -= 12;
  line("Bank transfer details", 11, true);
  const bank = inv.paymentInstructions || getBankDetails();
  line(`Account name: ${bank.accountName || "-"}`, 9);
  line(`BSB: ${bank.bsb || "-"}`, 9);
  line(`Account: ${bank.accountNumberMasked || "-"}`, 9);
  if (bank.swift) line(`SWIFT: ${bank.swift}`, 9);
  if (bank.bankName) line(`Bank: ${bank.bankName}`, 9);
  line(`Reference: ${(bank.paymentReferencePrefix || "INV") + "-" + inv.invoiceNumber}`, 9);
  y -= 10;
  if (inv.issuer?.abn) line(`ABN: ${inv.issuer.abn}`, 9);
  if (inv.terms) line(`Terms: ${String(inv.terms).slice(0, 180)}`, 9);
  line("Generated from the MinRosh admin panel.", 9);

  const bytes = await pdfDoc.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${inv.invoiceNumber}.pdf"`,
    },
  });
}
