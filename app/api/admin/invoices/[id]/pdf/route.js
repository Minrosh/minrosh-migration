import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { getInvoice } from "@/lib/admin/invoices-service";

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
  line(`Customer: ${inv.customerName}`);
  line(`Service: ${inv.service}`);
  line(`Amount: AUD ${Number(inv.amount).toFixed(2)}`);
  line(`Status: ${inv.status}`);
  y -= 10;
  line("Generated from the MinRosh admin panel.", 9);

  const bytes = await pdfDoc.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${inv.invoiceNumber}.pdf"`,
    },
  });
}
