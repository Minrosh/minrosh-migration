"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";
import { MINROSH_ISSUER_DEFAULT } from "@/lib/admin/invoice-defaults";
import { InvoiceCustomerPicker, billToCountryForGst } from "@/components/admin/invoice-customer-picker";

const columnHelper = createColumnHelper();

export function InvoicesPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [invoices, setInvoices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [invoicePayId, setInvoicePayId] = useState("info@minroshmigration.com.au");
  const [invoiceQrMode, setInvoiceQrMode] = useState("plain_text");
  const [qrModeSaving, setQrModeSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [discount, setDiscount] = useState("0");
  const [discountDescription, setDiscountDescription] = useState("");
  const [emailAfterCreate, setEmailAfterCreate] = useState(false);
  const [invoiceEmailTo, setInvoiceEmailTo] = useState("");
  const [lineItems, setLineItems] = useState([{ description: "", quantity: "1", unitPrice: "0" }]);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [terms, setTerms] = useState("");
  const [templateIsDefault, setTemplateIsDefault] = useState(false);
  const [issuerBusinessName, setIssuerBusinessName] = useState(MINROSH_ISSUER_DEFAULT.businessName);
  const [issuerAbn, setIssuerAbn] = useState(MINROSH_ISSUER_DEFAULT.abn);
  const [issuerAcn, setIssuerAcn] = useState(MINROSH_ISSUER_DEFAULT.acn);
  const [issuerAddress, setIssuerAddress] = useState(MINROSH_ISSUER_DEFAULT.address);
  const [issuerPhone, setIssuerPhone] = useState(MINROSH_ISSUER_DEFAULT.phone);
  const [issuerEmail, setIssuerEmail] = useState(MINROSH_ISSUER_DEFAULT.email);
  const [issuerLogoPath, setIssuerLogoPath] = useState(MINROSH_ISSUER_DEFAULT.logoPath);
  const [issuerTitleFontSize, setIssuerTitleFontSize] = useState(String(MINROSH_ISSUER_DEFAULT.titleFontSize));
  const [issuerBodyFontSize, setIssuerBodyFontSize] = useState(String(MINROSH_ISSUER_DEFAULT.bodyFontSize));
  const [showTemplateAdvanced, setShowTemplateAdvanced] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState("");
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerEmail, setEditCustomerEmail] = useState("");
  const [editCustomerContact, setEditCustomerContact] = useState("");
  const [editCustomerAddress, setEditCustomerAddress] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTerms, setEditTerms] = useState("");
  const [editDiscountDescription, setEditDiscountDescription] = useState("");
  const [paymentQrPreviewUrl, setPaymentQrPreviewUrl] = useState("");

  const load = useCallback(() => {
    Promise.all([fetch("/api/admin/invoices"), fetch("/api/admin/customers?limit=500")])
      .then(async ([invRes, custRes]) => {
        const invPayload = await invRes.json().catch(() => ({}));
        const custPayload = await custRes.json().catch(() => ({}));
        const d = invPayload?.data && typeof invPayload.data === "object" ? invPayload.data : invPayload;
        const c = custPayload?.data && typeof custPayload.data === "object" ? custPayload.data : custPayload;
        setInvoices(d.invoices || []);
        setTemplates(d.templates || []);
        setBankDetails(d.bankDetails || null);
        setInvoicePayId(String(d.invoicePayId || "info@minroshmigration.com.au"));
        setInvoiceQrMode(String(d.invoiceQrMode || "plain_text"));
        setCustomers(c.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!templates.length || selectedTemplateId) return;
    const def = templates.find((t) => t.isDefault);
    if (!def) return;
    setSelectedTemplateId(def.id);
    setTemplateName(def.name || "");
    setTerms(def.defaultTerms || "");
    setTemplateIsDefault(Boolean(def.isDefault));
    setIssuerBusinessName(def?.issuer?.businessName || MINROSH_ISSUER_DEFAULT.businessName);
    setIssuerAbn(def?.issuer?.abn || MINROSH_ISSUER_DEFAULT.abn);
    setIssuerAcn(def?.issuer?.acn || MINROSH_ISSUER_DEFAULT.acn);
    setIssuerAddress(def?.issuer?.address || MINROSH_ISSUER_DEFAULT.address);
    setIssuerPhone(def?.issuer?.phone || MINROSH_ISSUER_DEFAULT.phone);
    setIssuerEmail(def?.issuer?.email || MINROSH_ISSUER_DEFAULT.email);
    setIssuerLogoPath(def?.issuer?.logoPath || MINROSH_ISSUER_DEFAULT.logoPath);
    setIssuerTitleFontSize(String(def?.issuer?.titleFontSize ?? MINROSH_ISSUER_DEFAULT.titleFontSize));
    setIssuerBodyFontSize(String(def?.issuer?.bodyFontSize ?? MINROSH_ISSUER_DEFAULT.bodyFontSize));
    const rows = Array.isArray(def.lineDefaults) && def.lineDefaults.length
      ? def.lineDefaults.map((l) => ({
          description: l.description || "",
          quantity: String(l.quantity ?? 1),
          unitPrice: String(l.unitPrice ?? 0),
        }))
      : [{ description: "", quantity: "1", unitPrice: "0" }];
    setLineItems(rows);
  }, [templates, selectedTemplateId]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "pending" || statusFilter === "paid") {
      return invoices.filter((i) => i.status === statusFilter);
    }
    return invoices;
  }, [invoices, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("invoiceNumber", { header: " #" }),
      columnHelper.accessor("customerName", { header: "Customer" }),
      columnHelper.accessor("date", { header: "Date" }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (i) => `AUD ${Number(i.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor("service", { header: "Service" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (i) => {
          const v = i.getValue();
          const variant = v === "paid" ? "success" : v === "void" ? "secondary" : "warning";
          return <Badge variant={variant}>{v}</Badge>;
        },
      }),
      columnHelper.display({
        id: "pdf",
        header: "PDF",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <a
              className="text-primary underline"
              href={`/api/admin/invoices/${row.original.id}/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
            <a
              className="text-primary underline"
              href={`/api/admin/invoices/${row.original.id}/pdf?download=1`}
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          </div>
        ),
      }),
      columnHelper.display({
        id: "email",
        header: "Email",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={row.original.status === "void"}
            onClick={async () => {
              const recipient =
                prompt("Send invoice to email:", row.original.customerEmail || "") || row.original.customerEmail || "";
              if (!recipient) return;
              const res = await fetch("/api/admin/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "emailInvoice", id: row.original.id, to: recipient }),
              });
              const data = await res.json().catch(() => ({}));
              const payload = data;
              const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
              const errorMessage = payload?.error?.message || payload?.error || body?.error;
              if (!res.ok) {
                alert(errorMessage || "Could not send invoice email.");
                return;
              }
              alert("Invoice email sent.");
            }}
          >
            Email PDF
          </Button>
        ),
      }),
      columnHelper.display({
        id: "toggle",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={row.original.status === "void"}
            onClick={async () => {
              const next = row.original.status === "paid" ? "pending" : "paid";
              await fetch("/api/admin/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "setStatus", id: row.original.id, status: next }),
              });
              load();
            }}
          >
            Mark {row.original.status === "paid" ? "pending" : "paid"}
          </Button>
        ),
      }),
      columnHelper.display({
        id: "void",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-destructive hover:text-destructive"
            disabled={row.original.status === "void"}
            onClick={async () => {
              if (row.original.status === "void") return;
              const ok = window.confirm(
                `Void invoice ${row.original.invoiceNumber}? It will stay in the ledger as void and can no longer be toggled paid/pending here.`
              );
              if (!ok) return;
              const res = await fetch("/api/admin/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", id: row.original.id, patch: { status: "void" } }),
              });
              const data = await res.json().catch(() => ({}));
              const payload = data;
              const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
              const errorMessage = payload?.error?.message || payload?.error || body?.error;
              if (!res.ok) {
                window.alert(errorMessage || "Could not void invoice.");
                return;
              }
              load();
            }}
          >
            Void
          </Button>
        ),
      }),
      columnHelper.display({
        id: "edit",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={() => {
              const inv = row.original;
              setEditingInvoiceId(inv.id);
              setEditCustomerId(inv.customerId || "");
              setEditCustomerName(inv.customerName || "");
              setEditCustomerEmail(inv.customerEmail || "");
              setEditCustomerContact(inv.customerContact || inv.customerEmail || "");
              setEditCustomerAddress(inv.customerAddress || "");
              setEditDueDate(inv.dueDate || inv.date || "");
              setEditTerms(inv.terms || "");
              setEditDiscountDescription(inv.discountDescription || "");
            }}
          >
            Edit
          </Button>
        ),
      }),
    ],
    [load]
  );

  const table = useReactTable({
    data: filteredInvoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function createInvoice(e) {
    e.preventDefault();
    if (!String(customerId || "").trim()) {
      window.alert("Choose a CRM customer before creating an invoice.");
      return;
    }
    const normalizedLines = lineItems
      .map((l) => ({
        description: String(l.description || "").trim(),
        quantity: Number(l.quantity || 0),
        unitPrice: Number(l.unitPrice || 0),
      }))
      .filter((l) => l.description && Number.isFinite(l.quantity) && Number.isFinite(l.unitPrice) && l.quantity > 0);
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerId,
        customerEmail: String(customerEmail || "").trim(),
        customerCountry: billToCountryForGst(customers.find((c) => c.id === customerId)),
        customerContact,
        customerAddress,
        date,
        dueDate,
        service: normalizedLines[0]?.description || "Service",
        lineItems: normalizedLines,
        discount: parseFloat(discount) || 0,
        discountDescription,
        templateId: selectedTemplateId || undefined,
        terms,
        status: "pending",
      }),
    });
    const payload = await res.json().catch(() => ({}));
    const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    if (res.ok && emailAfterCreate && body?.invoice?.id) {
      const recipient = String(invoiceEmailTo || "").trim() || String(body?.invoice?.customerEmail || "").trim();
      if (recipient) {
        await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "emailInvoice", id: body.invoice.id, to: recipient }),
        });
      }
    }
    setCustomerName("");
    setCustomerId("");
    setCustomerEmail("");
    setCustomerContact("");
    setCustomerAddress("");
    setDiscount("0");
    setDiscountDescription("");
    setEmailAfterCreate(false);
    setInvoiceEmailTo("");
    setLineItems([{ description: "", quantity: "1", unitPrice: "0" }]);
    setTerms("");
    load();
  }

  function updateLineItem(idx, key, value) {
    setLineItems((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  }

  function applyCustomer(customerIdValue) {
    setCustomerId(customerIdValue);
    if (!customerIdValue) {
      setCustomerName("");
      setCustomerEmail("");
      setCustomerContact("");
      setCustomerAddress("");
      return;
    }
    const hit = customers.find((c) => c.id === customerIdValue);
    if (!hit) return;
    setCustomerName(hit.name || "");
    setCustomerEmail(String(hit.email || "").trim());
    setCustomerContact(hit.mobile || hit.email || "");
    const addr = [hit.addressLine1, hit.addressLine2, hit.city, hit.state, hit.postcode, hit.country]
      .filter(Boolean)
      .join(", ");
    setCustomerAddress(addr || "");
  }

  function applyEditCustomer(customerIdValue) {
    setEditCustomerId(customerIdValue);
    if (!customerIdValue) return;
    const hit = customers.find((c) => c.id === customerIdValue);
    if (!hit) return;
    setEditCustomerName(hit.name || "");
    setEditCustomerEmail(hit.email || "");
    setEditCustomerContact(hit.mobile || hit.email || "");
    const addr = [hit.addressLine1, hit.addressLine2, hit.city, hit.state, hit.postcode, hit.country]
      .filter(Boolean)
      .join(", ");
    setEditCustomerAddress(addr || "");
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "0" }]);
  }

  function removeLineItem(idx) {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function saveQrModeSetting(nextMode) {
    setQrModeSaving(true);
    const payload = {
      ...(bankDetails || {}),
      qrMode: nextMode,
    };
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setBankDetails", bankDetails: payload }),
    });
    const data = await res.json().catch(() => ({}));
    const payloadBody = data?.data && typeof data.data === "object" ? data.data : data;
    if (res.ok) {
      setBankDetails(payloadBody.bankDetails || payload);
      setInvoiceQrMode(String(payloadBody?.bankDetails?.qrMode || nextMode));
    }
    setQrModeSaving(false);
  }

  async function saveCurrentAsTemplate() {
    const normalizedLines = lineItems
      .map((l) => ({
        description: String(l.description || "").trim(),
        quantity: Number(l.quantity || 0),
        unitPrice: Number(l.unitPrice || 0),
        taxRate: 0.1,
      }))
      .filter((l) => l.description && Number.isFinite(l.quantity) && Number.isFinite(l.unitPrice) && l.quantity > 0);
    const payload = {
      id: selectedTemplateId || undefined,
      name: templateName || `Template ${new Date().toISOString().slice(0, 10)}`,
      currency: "AUD",
      defaultTerms: terms,
      lineDefaults: normalizedLines,
      isDefault: templateIsDefault,
      issuer: {
        businessName: issuerBusinessName,
        abn: issuerAbn,
        acn: issuerAcn,
        address: issuerAddress,
        phone: issuerPhone,
        email: issuerEmail,
        logoPath: issuerLogoPath,
        titleFontSize: Number(issuerTitleFontSize || 22),
        bodyFontSize: Number(issuerBodyFontSize || 10),
      },
    };
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsertTemplate", template: payload }),
    });
    const data = await res.json().catch(() => ({}));
    const payloadBody = data?.data && typeof data.data === "object" ? data.data : data;
    setTemplates(Array.isArray(payloadBody.templates) ? payloadBody.templates : []);
    if (payloadBody?.template?.id) setSelectedTemplateId(payloadBody.template.id);
  }

  function applyTemplate(templateId) {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setSelectedTemplateId(templateId);
    setTemplateName(tpl.name || "");
    setTerms(tpl.defaultTerms || "");
    setTemplateIsDefault(Boolean(tpl.isDefault));
    setIssuerBusinessName(tpl?.issuer?.businessName || MINROSH_ISSUER_DEFAULT.businessName);
    setIssuerAbn(tpl?.issuer?.abn || MINROSH_ISSUER_DEFAULT.abn);
    setIssuerAcn(tpl?.issuer?.acn || MINROSH_ISSUER_DEFAULT.acn);
    setIssuerAddress(tpl?.issuer?.address || MINROSH_ISSUER_DEFAULT.address);
    setIssuerPhone(tpl?.issuer?.phone || MINROSH_ISSUER_DEFAULT.phone);
    setIssuerEmail(tpl?.issuer?.email || MINROSH_ISSUER_DEFAULT.email);
    setIssuerLogoPath(tpl?.issuer?.logoPath || MINROSH_ISSUER_DEFAULT.logoPath);
    setIssuerTitleFontSize(String(tpl?.issuer?.titleFontSize ?? MINROSH_ISSUER_DEFAULT.titleFontSize));
    setIssuerBodyFontSize(String(tpl?.issuer?.bodyFontSize ?? MINROSH_ISSUER_DEFAULT.bodyFontSize));
    const rows = Array.isArray(tpl.lineDefaults) && tpl.lineDefaults.length
      ? tpl.lineDefaults.map((l) => ({
          description: l.description || "",
          quantity: String(l.quantity ?? 1),
          unitPrice: String(l.unitPrice ?? 0),
        }))
      : [{ description: "", quantity: "1", unitPrice: "0" }];
    setLineItems(rows);
  }

  const invoicePreview = useMemo(() => {
    const rows = lineItems
      .map((l) => {
        const qty = Number(l.quantity || 0);
        const unit = Number(l.unitPrice || 0);
        const amount = qty * unit;
        const gst = amount * 0.1;
        return { amount, gst };
      })
      .filter((r) => Number.isFinite(r.amount) && Number.isFinite(r.gst));
    const subtotal = rows.reduce((a, r) => a + r.amount, 0);
    const gstTotal = rows.reduce((a, r) => a + r.gst, 0);
    const discountNum = Math.max(0, Number(discount || 0));
    const total = Math.max(0, subtotal + gstTotal - discountNum);
    return {
      subtotal,
      gstTotal,
      discount: discountNum,
      total,
    };
  }, [lineItems, discount]);

  useEffect(() => {
    const amount = Number(invoicePreview.total || 0);
    if (!(amount > 0)) {
      setPaymentQrPreviewUrl("");
      return;
    }
    const reference = `${bankDetails?.paymentReferencePrefix || "INV"}-(invoice-number)`;
    const payId = String(invoicePayId || "info@minroshmigration.com.au").trim();
    const payload =
      invoiceQrMode === "npp_uri"
        ? `au-npp://pay?id=${encodeURIComponent(payId)}&amount=${amount.toFixed(2)}&ref=${encodeURIComponent(reference)}`
        : [`PayID: ${payId}`, `Amount: ${amount.toFixed(2)}`, `Reference: ${reference}`, "Use your banking app to pay."].join("\n");
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 132,
          color: { dark: "#050A18", light: "#F8FAFC" },
        });
        if (!cancelled) setPaymentQrPreviewUrl(dataUrl);
      } catch {
        if (!cancelled) setPaymentQrPreviewUrl("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invoicePreview.total, bankDetails?.paymentReferencePrefix, invoicePayId, invoiceQrMode]);

  async function saveInvoiceEdits(e) {
    e.preventDefault();
    if (!editingInvoiceId) return;
    await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id: editingInvoiceId,
        patch: {
          customerId: String(editCustomerId || "").trim(),
          customerName: editCustomerName,
          customerEmail: editCustomerEmail,
          customerContact: editCustomerContact,
          customerAddress: editCustomerAddress,
          dueDate: editDueDate,
          terms: editTerms,
          discountDescription: editDiscountDescription,
        },
      }),
    });
    setEditingInvoiceId("");
    load();
  }

  async function duplicateSelectedTemplate() {
    if (!selectedTemplateId) return;
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicateTemplate", id: selectedTemplateId }),
    });
    const data = await res.json().catch(() => ({}));
    const payload = data?.data && typeof data.data === "object" ? data.data : data;
    if (Array.isArray(payload.templates)) setTemplates(payload.templates);
    if (payload?.template?.id) {
      setSelectedTemplateId(payload.template.id);
      applyTemplate(payload.template.id);
    }
  }

  async function deleteSelectedTemplate() {
    if (!selectedTemplateId) return;
    const ok = confirm("Delete selected template? This will not delete already-created invoices.");
    if (!ok) return;
    const removedId = selectedTemplateId;
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTemplate", id: removedId }),
    });
    const data = await res.json().catch(() => ({}));
    const payload = data?.data && typeof data.data === "object" ? data.data : data;
    if (Array.isArray(payload.templates)) {
      setTemplates(payload.templates);
      const nextDefault = payload.templates.find((t) => t.isDefault) || payload.templates[0];
      if (nextDefault?.id) {
        applyTemplate(nextDefault.id);
      } else {
        setSelectedTemplateId("");
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Loading ledger…</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminTableSkeleton rows={5} cols={11} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New invoice</CardTitle>
            <CardDescription>
              Invoice number is assigned automatically (YYYY-####). Every new invoice must be linked to a CRM customer
              (search below); bill-to fields are prefilled from that record. Default terms use 14-day payment and Minrosh
              legal details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createInvoice} className="grid gap-4 sm:grid-cols-2">
            <InvoiceCustomerPicker
              label="Link to CRM customer"
              customers={customers}
              value={customerId}
              onChange={applyCustomer}
              required
            />
            <div className="space-y-2 sm:col-span-2">
              <Label>Bill-to name (on PDF)</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Filled from CRM — edit if the invoice should show a different display name"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Client email (for PDF and optional send)</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Filled from CRM customer record"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Client contact (phone/email)</Label>
              <Input
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="e.g. 0478 100 542 or client@email.com"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Client address</Label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Street, suburb, state, postcode"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email invoice after create (optional)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="email"
                  value={invoiceEmailTo}
                  onChange={(e) => setInvoiceEmailTo(e.target.value)}
                  placeholder="customer@email.com"
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={emailAfterCreate} onChange={(e) => setEmailAfterCreate(e.target.checked)} />
                  Send
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs text-muted-foreground">
                Invoice totals are calculated from service lines below (Qty x Unit Price + GST - Discount).
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2 rounded-md border border-border p-3">
              <Label className="mb-2 block">Invoice template manager</Label>
              <div className="grid grid-cols-12 gap-2">
                <select
                  className="col-span-7 h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                >
                  <option value="">Select template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <Input
                  className="col-span-3"
                  placeholder="Template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
                <Button type="button" className="col-span-2" variant="outline" onClick={saveCurrentAsTemplate}>
                  Save
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={duplicateSelectedTemplate} disabled={!selectedTemplateId}>
                  Duplicate
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={deleteSelectedTemplate} disabled={!selectedTemplateId}>
                  Delete
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplateAdvanced((v) => !v)}>
                  {showTemplateAdvanced ? "Hide advanced" : "Show advanced"}
                </Button>
              </div>
              {showTemplateAdvanced ? (
                <>
                  <div className="mt-3 grid grid-cols-12 gap-2">
                    <Input className="col-span-6" placeholder="Business name" value={issuerBusinessName} onChange={(e) => setIssuerBusinessName(e.target.value)} />
                    <Input className="col-span-3" placeholder="ABN" value={issuerAbn} onChange={(e) => setIssuerAbn(e.target.value)} />
                    <Input className="col-span-3" placeholder="ACN" value={issuerAcn} onChange={(e) => setIssuerAcn(e.target.value)} />
                    <Input className="col-span-5" placeholder="Address" value={issuerAddress} onChange={(e) => setIssuerAddress(e.target.value)} />
                    <Input className="col-span-3" placeholder="Phone" value={issuerPhone} onChange={(e) => setIssuerPhone(e.target.value)} />
                    <Input className="col-span-4" placeholder="Email" value={issuerEmail} onChange={(e) => setIssuerEmail(e.target.value)} />
                    <Input className="col-span-6" placeholder="Logo path in /public (e.g. /images/minrosh-logo.png)" value={issuerLogoPath} onChange={(e) => setIssuerLogoPath(e.target.value)} />
                    <Input className="col-span-3" type="number" min="14" max="32" step="1" placeholder="Title font size" value={issuerTitleFontSize} onChange={(e) => setIssuerTitleFontSize(e.target.value)} />
                    <Input className="col-span-3" type="number" min="8" max="14" step="1" placeholder="Body font size" value={issuerBodyFontSize} onChange={(e) => setIssuerBodyFontSize(e.target.value)} />
                  </div>
                  <label className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={templateIsDefault} onChange={(e) => setTemplateIsDefault(e.target.checked)} />
                    Set as default template (auto-used when creating invoices)
                  </label>
                </>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Save current terms + service lines as reusable template, then apply per customer.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Service lines (editable per customer)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  Add line
                </Button>
              </div>
              <div className="space-y-2">
                {lineItems.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 rounded-md border border-border p-2">
                    <Input
                      className="col-span-6"
                      placeholder="Description (include service date, e.g. Consultation on 2026-04-13)"
                      value={line.description}
                      onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                    />
                    <Input
                      className="col-span-2"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit price"
                      value={line.unitPrice}
                      onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                    />
                    <Button type="button" variant="ghost" className="col-span-1" onClick={() => removeLineItem(idx)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Discount (AUD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Terms for this invoice</Label>
              <Input value={terms} onChange={(e) => setTerms(e.target.value)} />
            </div>
            <div className="space-y-1 rounded-md border border-border bg-muted/30 p-3 text-sm sm:col-span-2">
              <p>Subtotal: AUD {invoicePreview.subtotal.toFixed(2)}</p>
              <p>GST (10%): AUD {invoicePreview.gstTotal.toFixed(2)}</p>
              <p>Discount: AUD {invoicePreview.discount.toFixed(2)}</p>
              <p className="font-semibold">Total payable: AUD {invoicePreview.total.toFixed(2)}</p>
            </div>
              <div className="space-y-2">
                <Label>Discount description</Label>
                <Input
                  value={discountDescription}
                  onChange={(e) => setDiscountDescription(e.target.value)}
                  placeholder="e.g. Loyalty discount / referral credit"
                />
              </div>
              <Button type="submit">Create invoice</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live invoice preview</CardTitle>
            <CardDescription>Xero-style preview panel for current form values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border bg-white p-6 text-sm shadow-sm">
              <div className="mb-9 flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={issuerLogoPath || "/images/minrosh-logo.png"}
                    alt=""
                    className="mb-3 h-16 w-auto rounded object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="text-[12px] font-bold uppercase tracking-tight">{issuerBusinessName || "Business Name"}</p>
                  <p className="text-[11px] text-muted-foreground">ABN: {issuerAbn || "-"}</p>
                  <p className="text-[11px] text-muted-foreground">{issuerAddress || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-light uppercase tracking-tight text-slate-800">Tax Invoice</p>
                  <p className="text-[13px] text-slate-600">
                    <span className="font-semibold">Invoice #:</span> Auto on create
                  </p>
                  <p className="text-[13px] text-slate-600">
                    <span className="font-semibold">Date:</span> {date}
                  </p>
                </div>
              </div>
              <div className="mb-6 grid grid-cols-2 gap-3 border-y border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Amount due</p>
                  <p className="text-[30px] font-bold text-slate-900">AUD {invoicePreview.total.toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">Customer: {customerName || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Due date</p>
                  <p className="text-[19px] font-semibold text-red-600">{dueDate || "-"}</p>
                </div>
              </div>
              <div className="mb-6 rounded border border-slate-200">
                <div className="grid grid-cols-12 border-b-2 border-slate-800 bg-slate-50 px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-2 text-right">Unit Price</span>
                  <span className="col-span-1 text-right">GST</span>
                  <span className="col-span-1 text-right">Amount AUD</span>
                </div>
                {lineItems.map((l, i) => (
                  <div key={i} className="grid grid-cols-12 border-t border-slate-200 px-2 py-1 text-[11px]">
                    <span className="col-span-6">{l.description || "(description)"}</span>
                    <span className="col-span-2 text-right">{Number(l.quantity || 0).toFixed(2)}</span>
                    <span className="col-span-2 text-right">{Number(l.unitPrice || 0).toFixed(2)}</span>
                    <span className="col-span-1 text-right">
                      {(Number(l.quantity || 0) * Number(l.unitPrice || 0) * 0.1).toFixed(2)}
                    </span>
                    <span className="col-span-1 text-right">
                      {(Number(l.quantity || 0) * Number(l.unitPrice || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p>Subtotal: AUD {invoicePreview.subtotal.toFixed(2)}</p>
                <p>GST: AUD {invoicePreview.gstTotal.toFixed(2)}</p>
                <p>Discount: AUD {invoicePreview.discount.toFixed(2)}</p>
                {discountDescription ? <p className="text-xs text-muted-foreground">Discount note: {discountDescription}</p> : null}
                <p className="font-semibold">Total: AUD {invoicePreview.total.toFixed(2)}</p>
              </div>
              <div className="mt-5 grid grid-cols-5 items-start gap-4">
                <div className="col-span-3 rounded-lg bg-slate-50 p-3 text-xs">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">How to pay</p>
                  <p>
                    <span className="font-semibold">Bank:</span> {bankDetails?.bankName || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Account Name:</span> {bankDetails?.accountName || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">BSB:</span> {bankDetails?.bsb || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Account Number:</span> {bankDetails?.accountNumber || bankDetails?.accountNumberMasked || "—"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Reference: {(bankDetails?.paymentReferencePrefix || "INV") + "-(invoice-number)"}
                  </p>
                  {paymentQrPreviewUrl ? (
                    <div className="mt-3 flex items-center gap-3 rounded border border-slate-200 bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={paymentQrPreviewUrl} alt="Payment QR preview" className="h-16 w-16 rounded border border-slate-200" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase text-slate-600">Scan to pay fast</p>
                        <p className="text-[10px] text-slate-500">
                          {invoiceQrMode === "npp_uri"
                            ? "Deep-link QR. Open with a banking app scanner."
                            : "Compatibility QR (shows payment details in any scanner)."}
                        </p>
                        <p className="text-[10px] text-slate-500">PayID: {invoicePayId || "—"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <label className="text-[10px] text-slate-500">QR mode</label>
                          <select
                            className="h-6 rounded border border-slate-200 bg-white px-1 text-[10px]"
                            value={invoiceQrMode}
                            onChange={(e) => {
                              const next = e.target.value;
                              setInvoiceQrMode(next);
                              saveQrModeSetting(next);
                            }}
                            disabled={qrModeSaving}
                          >
                            <option value="plain_text">Compatibility</option>
                            <option value="npp_uri">NPP deep-link</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="col-span-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>{invoicePreview.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1">
                    <span>GST 10%</span>
                    <span>{invoicePreview.gstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-base font-bold">
                    <span>Total</span>
                    <span>AUD {invoicePreview.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>All invoices</CardTitle>
            {statusFilter === "pending" || statusFilter === "paid" ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Filter: <strong className="text-foreground">{statusFilter}</strong> (
                  {filteredInvoices.length} shown)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => router.replace("/admin/invoices", { scroll: false })}
                >
                  Show all
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b text-left">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="p-2 font-semibold">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-muted-foreground">
                    {statusFilter === "pending" || statusFilter === "paid"
                      ? "No invoices match this filter."
                      : "No invoices yet. Create one above."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {editingInvoiceId ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit invoice details</CardTitle>
            <CardDescription>Update bill-to details and terms for the selected invoice.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveInvoiceEdits} className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <InvoiceCustomerPicker
                label="Link to CRM customer (optional)"
                customers={customers}
                value={editCustomerId}
                onChange={applyEditCustomer}
              />
              <div className="space-y-2">
                <Label>Client name</Label>
                <Input value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Client email</Label>
                <Input
                  type="email"
                  value={editCustomerEmail}
                  onChange={(e) => setEditCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Client contact</Label>
                <Input
                  value={editCustomerContact}
                  onChange={(e) => setEditCustomerContact(e.target.value)}
                  placeholder="Phone/email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Client address</Label>
                <Input
                  value={editCustomerAddress}
                  onChange={(e) => setEditCustomerAddress(e.target.value)}
                  placeholder="Street, suburb, state, postcode"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Terms</Label>
                <Input value={editTerms} onChange={(e) => setEditTerms(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Discount description</Label>
                <Input
                  value={editDiscountDescription}
                  onChange={(e) => setEditDiscountDescription(e.target.value)}
                  placeholder="Reason for discount"
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Save invoice</Button>
                <Button type="button" variant="outline" onClick={() => setEditingInvoiceId("")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
