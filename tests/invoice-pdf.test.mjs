import { describe, expect, it } from "vitest";
import { buildInvoicePdfBuffer } from "../lib/admin/invoice-pdf.js";

describe("invoice-pdf", () => {
  it("buildInvoicePdfBuffer returns a non-empty PDF buffer", async () => {
    const inv = {
      id: "INV-TEST-001",
      number: "INV-TEST-001",
      currency: "AUD",
      status: "draft",
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      lineItems: [{ description: "Migration consultation", quantity: 1, unitPrice: 250 }],
      subtotal: 250,
      total: 250,
      issuer: { name: "MinRosh Migration" },
    };
    const buffer = await buildInvoicePdfBuffer(inv, {});
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
